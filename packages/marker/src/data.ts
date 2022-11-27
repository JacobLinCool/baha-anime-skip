import fs from "node:fs";

export const FILE = "../baha-anime-skip-db/data.json";
export const data = JSON.parse(fs.readFileSync(FILE, "utf-8")) as Record<
    string,
    Record<string, [number, number]>
>;
