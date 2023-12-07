import { program } from "commander";
import os from "node:os";
import { no_matched_cache } from "./cache";
import { data } from "./data";
import { create_recent_list, create_rolling_list, create_series_list } from "./list";
import { run } from "./run";
import { Options } from "./types";

const defaults = {
    pool: "1200,2400,4800,9600,19200",
    lower: 84,
    upper: 92,
    range: "0,360",
    concurrency: Number(process.env.MARKER_CONCURRENCY) || os.cpus().length,
    keep: false,
    name: "OP",
    last: false,
};

program
    .option("-p, --pool <pool>", "pool size", defaults.pool)
    .option("-l, --lower <lower>", "lower bound", Number, defaults.lower)
    .option("-u, --upper <upper>", "upper bound", Number, defaults.upper)
    .option("-r, --range <from,to>", "range", defaults.range)
    .option("-c, --concurrency <concurrency>", "concurrency", Number, defaults.concurrency)
    .option("-k, --keep", "do not cleanup", defaults.keep)
    .option("-n, --name <name>", "chapter name", defaults.name)
    .option("--last", "use last-first strategy");

program.command("recent").action(async () => {
    const opt = parse_options(program.opts());
    console.log(JSON.stringify(opt));

    const list = await create_recent_list();
    const items = list.filter(
        (item) => !data[item.sn]?.[opt.name] && !no_matched_cache[opt.name]?.includes(item.sn),
    );
    await run(items, opt);
});

program
    .command("rolling")
    .option("-y, --year <year>", "rolling year", Number, new Date().getFullYear())
    .option("-m, --month <month>", "rolling month", Number, new Date().getMonth() + 1)
    .option("--limit <limit>", "rolling limit", Number, 12 * 100)
    .action(async ({ year, month, limit }: { year: number; month: number; limit: number }) => {
        const opt = parse_options(program.opts());
        console.log(JSON.stringify(opt));

        const list = await create_rolling_list(year, month, limit);
        const items = list.filter(
            (item) => !data[item.sn]?.[opt.name] && !no_matched_cache[opt.name]?.includes(item.sn),
        );
        await run(items, opt);
    });

program.command("single <sn>").action(async (sn: string) => {
    const opt = parse_options(program.opts());
    console.log(JSON.stringify(opt));

    const list = [{ sn }];
    if (data[sn]?.[opt.name]) {
        console.log(`skip ${sn} ${opt.name}`);
        return;
    }
    await run(list, opt);
});

program.command("series <sn>").action(async (sn: string) => {
    const opt = parse_options(program.opts());
    console.log(JSON.stringify(opt));

    const list = await create_series_list(sn);
    const items = list.filter(
        (item) => !data[item.sn]?.[opt.name] && !no_matched_cache[opt.name]?.includes(item.sn),
    );

    await run(items, opt);
});

program.parse();

function parse_options(opt: typeof defaults): Options {
    const pool = opt.pool.split(",").map((x) => Number(x));
    const [from, to] = opt.range.split(",").map((x) => Number(x));
    const { lower, upper, concurrency, keep, name, last } = opt;

    return { pool, from, to, lower, upper, concurrency, keep, name, last };
}
