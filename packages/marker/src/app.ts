import os from "node:os";
import { program } from "commander";
import { console_term } from "./term";
import { Options } from "./types";
import { no_matched_cache } from "./cache";
import { create_recent_list, create_rolling_list } from "./list";
import { run } from "./run";
import { data } from "./data";

const defaults = {
    pool: "1200,2400,4800,9600,19200",
    lower: 84,
    upper: 92,
    range: "0,360",
    concurrency: os.cpus().length,
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
    console_term.stdout.write(JSON.stringify(opt) + "\n");

    const list = await create_recent_list();
    const items = list.filter(
        (item) => !data[item.sn]?.[opt.name] && !no_matched_cache[opt.name]?.includes(item.sn),
    );
    await run(items, opt);
});

program
    .command("rolling")
    .option("-y, --year <year>", "rolling year", Number, new Date().getFullYear())
    .action(async ({ year }: { year: number }) => {
        const opt = parse_options(program.opts());
        console_term.stdout.write(JSON.stringify(opt) + "\n");

        const list = await create_rolling_list(year);
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
