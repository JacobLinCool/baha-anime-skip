import fs from "node:fs";
import prettier from "prettier";
import { z } from "zod";

const schema = z.record(z.string().regex(/^\d+$/), z.record(z.tuple([z.number(), z.number()])));

const data = JSON.parse(fs.readFileSync("data.json", "utf-8"));

schema.parse(data);

prettier.format(JSON.stringify(data), { parser: "json", tabWidth: 4 }).then((formatted) => {
    fs.writeFileSync("data.json", formatted);
});
