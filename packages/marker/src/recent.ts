import fs from "node:fs";
import fetch from "node-fetch";
import { marker } from ".";

const INDEX = "https://api.gamer.com.tw/mobile_app/anime/v3/index.php";
const FILE = "../baha-anime-skip-db/data.json";
const CACHE = "./.cache";
if (!fs.existsSync(CACHE)) {
    fs.writeFileSync(CACHE, "[]");
}

const original = JSON.parse(fs.readFileSync(FILE, "utf-8")) as Record<
    string,
    Record<string, [number, number]>
>;
const cache = JSON.parse(fs.readFileSync(CACHE, "utf-8")) as string[];

main();

async function main() {
    let items: { title: string; sn: string; ignore: boolean }[] = await fetch(INDEX)
        .then((res) => res.json())
        .then((data) =>
            data.data.newAnime.date.map((item: any) => ({
                title: item.title,
                sn: item.videoSn,
                ignore: item.volume === "電影" || item.highlightTag.vipTime,
            })),
        );

    const alive_cache = cache.filter((sn) => items.some((item) => item.sn === sn));

    const pools = [1200, 2400, 4800, 9600, 19200];
    for (const pool of pools) {
        console.log(`Pool: ${pool}`);

        items = items.filter(
            (item) => !item.ignore && !original[item.sn] && !alive_cache.includes(item.sn),
        );
        console.log(items);

        if (items.length === 0) {
            continue;
        }

        const results = await marker(
            items.map((item) => item.sn),
            { pool, lower: 82, upper: 92, keep: true },
        );
        console.log(JSON.stringify(results, null, 4));

        Object.assign(original, results);
        fs.writeFileSync(FILE, JSON.stringify(original, null, 4));
    }

    items = items.filter(
        (item) => !item.ignore && !original[item.sn] && !alive_cache.includes(item.sn),
    );
    fs.writeFileSync(CACHE, JSON.stringify([...alive_cache, ...items.map((item) => item.sn)]));
}
