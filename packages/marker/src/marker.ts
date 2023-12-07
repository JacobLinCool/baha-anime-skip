import { AnimeDetailInfo, DetailCrawler, RateLimiter } from "baha-anime-crawler";
import { Downloader, default_config } from "baha-anime-dl";
import { merge } from "baha-anime-dl-ext";
import debug from "debug";
import { partition } from "lcsb";
import { exec } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

debug.enable("baha-anime-dl*");

export async function marker(
    sn: string[],
    {
        pool = 4800,
        lower = 75,
        upper = 95,
        before = 6 * 60,
        after = 0 * 60,
        concurrency = os.cpus().length,
        keep = false,
        ref = false,
        raise = false,
        chapter = "OP",
        priority = 1,
    }: {
        ref?: boolean;
        pool?: number;
        lower?: number;
        upper?: number;
        before?: number;
        after?: number;
        concurrency?: number;
        keep?: boolean;
        raise?: boolean;
        chapter?: string;
        priority?: 1 | 2;
    } = {},
): Promise<Record<string, Record<string, [number, number]>>> {
    if (sn.length === 0) {
        console.log("Too few arguments");
        process.exit(1);
    }

    const sn_list = ref ? await get_sn(sn[0]) : sn.map((item) => +item);
    sn_list.sort((a, b) => a - b);
    const limiter = new RateLimiter({ concurrent: concurrency });

    const temp = path.join(os.tmpdir(), "waves-tmp");
    if (!fs.existsSync(temp)) {
        fs.mkdirSync(temp, { recursive: true });
    }

    await Promise.all(
        sn_list.map(async (sn) => {
            await limiter.lock();
            try {
                await download(sn, temp, keep);
            } catch {
                limiter.unlock();
                if (raise) {
                    throw new Error("Failed to download");
                }
            }
            limiter.unlock();
        }),
    );

    const availables = sn_list.filter((sn) => fs.existsSync(path.join(temp, `${sn}.wav`)));
    const waves = availables.sort((a, b) => a - b).map((sn) => `${sn}.wav`);
    const blocks = waves
        .map((file) => fs.readFileSync(path.join(temp, file)))
        .map((buffer) =>
            partition(buffer, { pool, lower, upper })
                .filter((b) => b.start < before && b.end > after)
                .map((b) => {
                    b.duration = +b.duration.toFixed(2);
                    return b;
                }),
        );

    for (let i = 0; i < blocks.length; i++) {
        console.log(`${availables[i]} ${JSON.stringify(blocks[i])}`);
    }

    const result = availables.reduce(
        (dict, sn, idx) => {
            if (priority === 2) {
                blocks.reverse();
            }

            const block = blocks[idx].find(
                (b) =>
                    b.start < before && b.end > after && b.duration >= lower && b.duration <= upper,
            );
            if (block) {
                dict[sn] = {
                    [chapter]: [+block.start.toFixed(2), +block.duration.toFixed(2)],
                };
            }
            return dict;
        },
        {} as Record<string, Record<string, [number, number]>>,
    );

    waves.forEach((wav) => (keep ? null : fs.rmSync(path.join(temp, wav), { recursive: true })));

    return result;
}

async function get_sn(ref: string) {
    const crawler = new DetailCrawler([{ ref: +ref } as AnimeDetailInfo]);
    const db = await crawler.crawl();

    const target = db.find((item) => item.ref === +ref);
    if (!target) {
        throw new Error("Not found");
    }

    return Object.values(target.episodes);
}

async function download(sn: number, dir: string, keep: boolean) {
    const tmp = path.join(dir, sn.toString());
    const mp4 = path.join(tmp, `${sn}.mp4`);
    const wav = path.join(dir, `${sn}.wav`);

    fs.mkdirSync(tmp, { recursive: true });

    if (!fs.existsSync(mp4)) {
        const downloader = new Downloader({
            ...default_config(),
            concurrency: 2,
        });
        await downloader.init();

        const download = downloader.download(sn);
        download.meta.catch(() => { });
        const merged = await merge(download);

        fs.writeFileSync(mp4, Buffer.from(merged));
    }

    if (!fs.existsSync(wav) && fs.existsSync(mp4)) {
        const ffmpeg_cmd = `ffmpeg -i ${mp4} -acodec pcm_s16le -ac 1 ${wav}`;
        const ffmpeg_process = exec(ffmpeg_cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        });

        await new Promise<void>((resolve) => {
            ffmpeg_process.on("exit", resolve);
        });
    }

    if (!keep) {
        fs.rmSync(tmp, { recursive: true });
    }
}
