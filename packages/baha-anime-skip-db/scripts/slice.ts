import fs from "node:fs";

const data: Record<string, Record<string, [number, number]>> = JSON.parse(
    fs.readFileSync("data.json", "utf-8"),
);

const dir = "data";
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

for (const [key, value] of Object.entries(data)) {
    fs.writeFileSync(`${dir}/${key}.json`, JSON.stringify(value));
}
