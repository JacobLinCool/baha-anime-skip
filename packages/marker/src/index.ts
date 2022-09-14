import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { exec } from "node:child_process";
import { DetailCrawler, RateLimiter, AnimeDetailInfo } from "baha-anime-crawler";
import { partition } from "lcsb";
import { MultiTerm, Term } from "multi-term";
import update from "log-update";

export const multi_term = new MultiTerm(3, process.stdout.columns - 2);
process.stdout.on("resize", () => {
    multi_term.width = process.stdout.columns - 2;
});

let lazy_update: null | NodeJS.Timeout = null;
multi_term.on("stdout", () => {
    if (lazy_update) {
        return;
    }

    lazy_update = setTimeout(() => {
        lazy_update = null;
        update(multi_term.mixed);
    }, 500);
});
export const main_term = new Term("Console");
multi_term.add(main_term);

export async function marker(
    sn: string[],
    {
        pool = 4800,
        lower = 75,
        upper = 95,
        before = 6 * 60,
        concurrency = os.cpus().length,
        keep = false,
        ref = false,
    }: {
        ref?: boolean;
        pool?: number;
        lower?: number;
        upper?: number;
        before?: number;
        concurrency?: number;
        keep?: boolean;
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

    await Promise.all(
        sn_list.map(async (sn) => {
            await limiter.lock();
            try {
                await download(sn, temp, keep);
            } finally {
                limiter.unlock();
            }
        }),
    );

    const availables = sn_list.filter((sn) => fs.existsSync(path.join(temp, `${sn}.wav`)));
    const waves = availables.sort((a, b) => a - b).map((sn) => `${sn}.wav`);
    const blocks = waves
        .map((file) => fs.readFileSync(path.join(temp, file)))
        .map((buffer) =>
            partition(buffer, { pool, lower, upper })
                .filter((b) => b.start < before)
                .map((b) => {
                    b.duration = +b.duration.toFixed(2);
                    return b;
                }),
        );

    for (let i = 0; i < blocks.length; i++) {
        main_term.stdout.write(`${availables[i]} ${JSON.stringify(blocks[i])}\n`);
    }

    const result = availables.reduce((dict, sn, idx) => {
        const block = blocks[idx].find(
            (b) => b.start < before && b.duration >= lower && b.duration <= upper,
        );
        if (block) {
            dict[sn] = {
                OP: [+block.start.toFixed(2), +block.duration.toFixed(2)],
            };
        }
        return dict;
    }, {} as Record<string, Record<string, [number, number]>>);

    if (!keep) {
        fs.rmSync(temp, { recursive: true });
    }
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
        const dl_cmd = `docker run --rm -v ${tmp}:/app/bangumi jacoblincool/anigamerplus -s ${sn} -r 360 -n`;
        const dl_process = exec(dl_cmd);

        const term = new Term(`Downloading ${sn}`);
        multi_term.add(term);

        await new Promise((resolve) => {
            dl_process.on("exit", () => {
                multi_term.remove(term);
                resolve(null);
            });
            dl_process.stdout?.pipe(term.stdout);
            dl_process.stderr?.pipe(term.stderr);
        });

        const files = fs.readdirSync(tmp);
        if (files.length > 0) {
            fs.renameSync(path.join(tmp, files[0]), mp4);
        }
    }

    if (!fs.existsSync(wav) && fs.existsSync(mp4)) {
        const ffmpeg_cmd = `ffmpeg -i ${mp4} -acodec pcm_s16le -ac 1 ${wav}`;
        const ffmpeg_process = exec(ffmpeg_cmd);

        const term = new Term(`Converting ${sn}`);
        multi_term.add(term);

        await new Promise((resolve) => {
            ffmpeg_process.on("exit", () => {
                multi_term.remove(term);
                resolve(null);
            });
            ffmpeg_process.stdout?.pipe(term.stdout);
            ffmpeg_process.stderr?.pipe(term.stderr);
        });
    }

    if (!keep) {
        fs.rmSync(tmp, { recursive: true });
    }
}
