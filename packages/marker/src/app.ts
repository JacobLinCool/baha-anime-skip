import fs from "node:fs";
import os from "node:os";
import fetch from "node-fetch";
import { program } from "commander";
import { ListCrawler, DetailCrawler, RateLimiter } from "baha-anime-crawler";
import ora from "ora";
import { mapping } from "file-mapping";
import { console_term } from "./term";
import { marker } from ".";

const FILE = "../baha-anime-skip-db/data.json";
const data = JSON.parse(fs.readFileSync(FILE, "utf-8")) as Record<
    string,
    Record<string, [number, number]>
>;
const NO_MATCHED_CACHE = "./no-matched.cache";
const FAILED_CACHE = "./failed.cache";
const no_matched_cache: string[] = mapping(NO_MATCHED_CACHE, []);
const failed_cache: string[] = mapping(FAILED_CACHE, []);

const defaults = {
    pool: "1200,2400,4800,9600,19200",
    lower: 84,
    upper: 92,
    range: "0,360",
    concurrency: os.cpus().length,
    keep: false,
};

program
    .option("-p, --pool <pool>", "pool size", defaults.pool)
    .option("-l, --lower <lower>", "lower bound", Number, defaults.lower)
    .option("-u, --upper <upper>", "upper bound", Number, defaults.upper)
    .option("-b, --range <from,to>", "range", defaults.range)
    .option("-c, --concurrency <concurrency>", "concurrency", Number, defaults.concurrency)
    .option("-k, --keep", "do not cleanup", defaults.keep);

program.command("recent").action(async () => {
    const opt = parse_options(program.opts());
    console_term.stdout.write(JSON.stringify(opt) + "\n");

    const list = await create_recent_list();
    const items = list.filter((item) => !data[item.sn] && !no_matched_cache.includes(item.sn));
    await run(items, opt);
});

program
    .command("rolling")
    .option("-y, --year <year>", "rolling year", Number, new Date().getFullYear())
    .action(async ({ year }: { year: number }) => {
        const opt = parse_options(program.opts());
        console_term.stdout.write(JSON.stringify(opt) + "\n");

        const list = await create_rolling_list(year);
        const items = list.filter((item) => !data[item.sn] && !no_matched_cache.includes(item.sn));
        await run(items, opt);
    });

program.parse();

function parse_options(opt: typeof defaults): Options {
    const pool = opt.pool.split(",").map((x) => Number(x));
    const [from, to] = opt.range.split(",").map((x) => Number(x));
    const { lower, upper, concurrency, keep } = opt;

    return { pool, from, to, lower, upper, concurrency, keep };
}

async function create_recent_list(): Promise<{ sn: string }[]> {
    const INDEX = "https://api.gamer.com.tw/mobile_app/anime/v3/index.php";

    const items: { title: string; sn: string; ignore: boolean }[] = await fetch(INDEX)
        .then((res) => res.json())
        .then((data) =>
            data.data.newAnime.date.map((item: any) => ({
                title: item.title,
                sn: item.videoSn,
                ignore: item.volume === "電影" || item.highlightTag.vipTime,
            })),
        );

    return items.filter((item) => !item.ignore).map((item) => ({ sn: item.sn }));
}

async function create_rolling_list(year: number): Promise<{ sn: string }[]> {
    const CACHE_FILE = "rolling-list.cache";

    if (!fs.existsSync(CACHE_FILE)) {
        const spinner = ora("Fetching list").start();
        const list_crawler = new ListCrawler();
        list_crawler.on("progress", (current, total) => {
            spinner.text = `Fetching list: ${current} / ${total}`;
        });
        const list = await list_crawler.crawl();

        spinner.text = "Fetching details";
        const detail_crawler = new DetailCrawler(
            list.filter((item) => !item.r18 && !item.premium && item.date.year === year),
        );
        detail_crawler.on("progress", (current, total) => {
            spinner.text = `Fetching details: ${current} / ${total}`;
        });
        const details = await detail_crawler.crawl();
        fs.writeFileSync(
            CACHE_FILE,
            JSON.stringify(
                details
                    .map((item) => Object.values(item.episodes))
                    .flat()
                    .sort((a, b) => b - a),
            ),
        );
        spinner.succeed("Done");
    }

    const details = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8")) as number[];

    return details.map((sn) => ({ sn: sn.toString() }));
}

async function run(items: { sn: string }[], opt: Options) {
    const limiter = new RateLimiter({ concurrent: opt.concurrency });

    let count = 0;
    const tasks: Promise<void>[] = [];

    for (const item of items) {
        tasks.push(
            (async () => {
                await limiter.lock();
                console_term.stdout.write(`${item.sn}\n`);

                try {
                    for (const pool of opt.pool) {
                        const results = await marker([item.sn], {
                            pool,
                            lower: opt.lower,
                            upper: opt.upper,
                            after: opt.from,
                            before: opt.to,
                            keep: true,
                            raise: true,
                        });

                        if (!results[item.sn] || Object.keys(results[item.sn]).length === 0) {
                            if (pool === opt.pool[opt.pool.length - 1]) {
                                no_matched_cache.push(item.sn);
                            }
                            continue;
                        }

                        console_term.stdout.write(`${item.sn} ${JSON.stringify(results)}\n`);

                        Object.assign(data, results);

                        if (++count >= 5) {
                            fs.writeFileSync(FILE, JSON.stringify(data));
                            count = 0;
                        }

                        if (opt.keep === false) {
                            await marker([item.sn], {
                                lower: 9999,
                                after: 0,
                                before: 0,
                                keep: opt.keep,
                            });
                        }

                        break;
                    }
                } catch (err) {
                    failed_cache.push(item.sn);
                    console_term.stderr.write(`${(err as Error).toString()}\n`);
                }

                limiter.unlock();
            })(),
        );
    }

    while ((await Promise.all(tasks)).length !== tasks.length) {
        // keep waiting for all tasks to finish
    }

    if (count > 0) {
        fs.writeFileSync(FILE, JSON.stringify(data));
    }
}

interface Options {
    pool: number[];
    from: number;
    to: number;
    lower: number;
    upper: number;
    concurrency: number;
    keep: boolean;
}
