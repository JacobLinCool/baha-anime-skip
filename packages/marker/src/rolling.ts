import fs from "node:fs";
import os from "node:os";
import ora from "ora";
import { ListCrawler, DetailCrawler, RateLimiter } from "baha-anime-crawler";
import { marker } from ".";
import { console_term } from "./term";

const FILE = "../baha-anime-skip-db/data.json";
const CACHE = "ignore.cache";
if (!fs.existsSync(CACHE)) {
    fs.writeFileSync(CACHE, "[]");
}

const original = JSON.parse(fs.readFileSync(FILE, "utf-8")) as Record<
    string,
    Record<string, [number, number]>
>;

main();

async function main() {
    const cache = JSON.parse(fs.readFileSync(CACHE, "utf-8")) as string[];
    let items: { sn: string }[] = await create_index();
    const pools = [1200, 2400, 4800, 9600, 19200];

    items = items.filter((item) => !original[item.sn] && !cache.includes(item.sn));

    const limiter = new RateLimiter({ concurrent: os.cpus().length });

    let count = 0;
    const tasks: Promise<void>[] = [];

    for (const item of items) {
        tasks.push(
            (async () => {
                await limiter.lock();
                console_term.stdout.write(`${item.sn}\n`);

                try {
                    for (const pool of pools) {
                        const results = await marker([item.sn], {
                            pool,
                            lower: 84,
                            upper: 92,
                            keep: true,
                        });

                        if (!results[item.sn] || Object.keys(results[item.sn]).length === 0) {
                            if (pool === pools[pools.length - 1]) {
                                cache.push(item.sn);
                                fs.writeFileSync(CACHE, JSON.stringify(cache));
                            }
                            continue;
                        }

                        console_term.stdout.write(`${item.sn} ${JSON.stringify(results)}\n`);

                        Object.assign(original, results);

                        if (++count >= 5) {
                            fs.writeFileSync(FILE, JSON.stringify(original));
                            count = 0;
                        }

                        break;
                    }
                } catch (err) {
                    console_term.stderr.write(`${(err as Error).toString()}\n`);
                }

                limiter.unlock();
            })(),
        );
    }

    while ((await Promise.all(tasks)).length !== tasks.length) {
        // keep waiting
    }

    if (count > 0) {
        fs.writeFileSync(FILE, JSON.stringify(original));
    }
}

async function create_index(): Promise<{ sn: string }[]> {
    if (!fs.existsSync("details.cache")) {
        const spinner = ora("Fetching list").start();
        const list_crawler = new ListCrawler();
        list_crawler.on("progress", (current, total) => {
            spinner.text = `Fetching list: ${current} / ${total}`;
        });
        const list = await list_crawler.crawl();

        spinner.text = "Fetching details";
        const detail_crawler = new DetailCrawler(
            list.filter((item) => !item.r18 && !item.premium && item.date.year === 2015),
        );
        detail_crawler.on("progress", (current, total) => {
            spinner.text = `Fetching details: ${current} / ${total}`;
        });
        const details = await detail_crawler.crawl();
        fs.writeFileSync(
            "details.cache",
            JSON.stringify(
                details
                    .map((item) => Object.values(item.episodes))
                    .flat()
                    .sort((a, b) => b - a),
            ),
        );
        spinner.succeed("Done");
    }

    const details = JSON.parse(fs.readFileSync("details.cache", "utf-8")) as number[];

    return details.map((sn) => ({ sn: sn.toString() }));
}
