import os from "node:os";
import { program } from "commander";
import { mapping } from "file-mapping";
import { helper } from "./index";

const data = mapping(
    "../baha-anime-skip-db/data.json",
    {} as Record<string, Record<string, [number, number]>>,
);

program
    .argument("<sn...>", "serial numbers of the target")
    .option("--ref", "use ref instead of serial numbers")
    .option("-p, --pool <pool>", "pool size", Number, 4800)
    .option("-l, --lower <lower>", "lower bound", Number, 60)
    .option("-u, --upper <upper>", "upper bound", Number, 100)
    .option("-b, --before <seconds>", "before seconds", Number, 8 * 60)
    .option("-a, --after <seconds>", "after seconds", Number, 0 * 60)
    .option("-t, --tolerance <seconds>", "block tolerance seconds", Number, 0.4)
    .option("-c, --concurrency <concurrency>", "concurrency", Number, os.cpus().length)
    .option("-s, --simple", "simple mode")
    .option("-k, --keep", "do not cleanup")
    .option("-w, --write", "write to file")
    .action(async (sn: string[], options) => {
        if (!options.ref) {
            const result = await helper(sn, options);
            console.log(JSON.stringify(result, null, 4));

            if (options.write) {
                for (const [key, value] of Object.entries(result)) {
                    data[key] = value;
                }
            }
        } else {
            for (const key of sn) {
                try {
                    const result = await helper([key], options);
                    console.log(JSON.stringify(result, null, 4));

                    if (options.write) {
                        for (const [key, value] of Object.entries(result)) {
                            data[key] = value;
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        }
    })
    .parse();
