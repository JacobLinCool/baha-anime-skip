import { RateLimiter } from "baha-anime-crawler";
import fs from "node:fs";
import { failed_cache, no_matched_cache } from "./cache";
import { FILE, data } from "./data";
import { marker } from "./marker";
import { Options } from "./types";

export async function run(items: { sn: string }[], opt: Options): Promise<void> {
    const limiter = new RateLimiter({ concurrent: opt.concurrency });

    let count = 0;
    const tasks: Promise<void>[] = [];

    for (const item of items) {
        tasks.push(
            (async () => {
                await limiter.lock();
                console.log(`start ${item.sn} ${opt.name}`);

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
                            chapter: opt.name,
                            priority: opt.last ? 2 : 1,
                        });

                        if (!results[item.sn] || Object.keys(results[item.sn]).length === 0) {
                            if (pool === opt.pool[opt.pool.length - 1]) {
                                if (!no_matched_cache[opt.name]) {
                                    no_matched_cache[opt.name] = [];
                                }
                                no_matched_cache[opt.name].push(item.sn);
                            }
                            continue;
                        }

                        console.log(`${item.sn} ${JSON.stringify(results)}`);

                        for (const [name, result] of Object.entries(results[item.sn])) {
                            if (!data[item.sn]) {
                                data[item.sn] = {};
                            }
                            data[item.sn][name] = result;
                        }

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
                                chapter: opt.name,
                            });
                        }

                        break;
                    }
                } catch (err) {
                    if (!failed_cache[opt.name]) {
                        failed_cache[opt.name] = [];
                    }
                    failed_cache[opt.name].push(item.sn);
                    console.error((err as Error).toString());
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
