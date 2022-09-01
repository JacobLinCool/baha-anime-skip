import fs from "node:fs";
import { z } from "zod";
import prettier from "prettier";

const schema = z.record(z.string().regex(/^\d+$/), z.record(z.tuple([z.number(), z.number()])));

const data = JSON.parse(fs.readFileSync("data.json", "utf-8"));

schema.parse(data);

fs.writeFileSync(
    "data.json",
    prettier.format(JSON.stringify(data), { parser: "json", tabWidth: 4 }),
);
