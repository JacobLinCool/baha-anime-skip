import fs from "node:fs";
import fetch from "node-fetch";
import { ListCrawler, DetailCrawler } from "baha-anime-crawler";
import { Anime } from "bahamut-anime";
import ora from "ora";

export async function create_recent_list(): Promise<{ sn: string }[]> {
    const INDEX = "https://api.gamer.com.tw/mobile_app/anime/v3/index.php";

    const items: { title: string; sn: string; ignore: boolean }[] = await fetch(INDEX)
        .then((res) => res.json())
        .then((data) =>
            data.data.newAnime.date.map((item: any) => ({
                title: item.title,
                sn: item.videoSn,
                ignore: item.volume === "電影" || item.highlightTag.vipTime,
            })),
        );

    return items.filter((item) => !item.ignore).map((item) => ({ sn: item.sn }));
}

export async function create_rolling_list(
    year: number,
    month: number,
    limit = 12 * 100,
): Promise<{ sn: string }[]> {
    const CACHE_FILE = "rolling-list.cache";

    if (!fs.existsSync(CACHE_FILE)) {
        const spinner = ora("Fetching list").start();
        const list_crawler = new ListCrawler();
        list_crawler.on("progress", (current, total) => {
            spinner.text = `Fetching list: ${current} / ${total}`;
        });
        const list = await list_crawler.crawl();

        spinner.text = "Fetching details";
        const detail_crawler = new DetailCrawler(
            list.filter(
                (item) =>
                    !item.r18 &&
                    !item.premium &&
                    ((item.date.year === year && item.date.month <= month) ||
                        item.date.year < year),
            ),
        );
        detail_crawler.on("progress", (current, total) => {
            spinner.text = `Fetching details: ${current} / ${total}`;
        });
        const details = (await detail_crawler.crawl()).sort(
            (a, b) => b.date.year - a.date.year || b.date.month - a.date.month,
        );
        fs.writeFileSync(
            CACHE_FILE,
            JSON.stringify(
                details
                    .map((item) => Object.values(item.episodes))
                    .flat()
                    .slice(0, limit),
            ),
        );
        spinner.succeed("Done");
    }

    const details = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8")) as number[];

    return details.map((sn) => ({ sn: sn.toString() }));
}

export async function create_series_list(sn: string): Promise<{ sn: string }[]> {
    const anime = new Anime(+sn);
    const episodes = Object.values(await anime.episodes()).flat();
    return episodes.map(({ sn }) => ({ sn: sn.toString() }));
}
