import { DetailCrawler, ListCrawler } from "baha-anime-crawler";
import { Anime } from "bahamut-anime";
import fetch from "node-fetch";
import fs from "node:fs";
import ora from "ora";

export async function create_recent_list(): Promise<{ sn: string }[]> {
    const INDEX = "https://api.gamer.com.tw/mobile_app/anime/v3/index.php";

    const items: { title: string; sn: string; ignore: boolean }[] = await fetch(INDEX)
        .then((res) => res.json() as Promise<IndexData>)
        .then((data) =>
            data.data.newAnime.date.map((item) => ({
                title: item.title,
                sn: item.videoSn,
                ignore: item.volume === "電影" || !!item.highlightTag.vipTime,
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

export interface IndexData {
    data: {
        announce: string;
        newAnime: NewAnime;
        newAnimeSchedule: NewAnimeSchedule;
        aniChannel: AniChannel[];
        hotAnime: HotAnime[];
        newAdded: NewAdded[];
        category: Category[];
        gnnList: GnnList[];
        forumList: ForumList[];
        ad: unknown[];
        lastAniUpTime: number;
    };
}

export interface NewAnime {
    date: Date[];
    popular: Popular[];
}

export interface Date {
    acgSn: string;
    videoSn: string;
    animeSn: string;
    title: string;
    dcC1: string;
    dcC2: string;
    week: string;
    favorite: boolean;
    cover: string;
    upTime: string;
    upTimeHours: string;
    volume: string;
    popular: string;
    highlightTag: HighlightTag;
}

export interface HighlightTag {
    bilingual: boolean;
    edition: string;
    vipTime: string;
}

export interface Popular {
    acgSn: string;
    videoSn: string;
    animeSn: string;
    title: string;
    dcC1: string;
    dcC2: string;
    week: string;
    favorite: boolean;
    cover: string;
    upTime: string;
    upTimeHours: string;
    volume: string;
    popular: string;
    highlightTag: HighlightTag;
}

export interface NewAnimeSchedule {
    "1": DailySchedule[];
    "2": DailySchedule[];
    "3": DailySchedule[];
    "4": DailySchedule[];
    "5": DailySchedule[];
    "6": DailySchedule[];
    "7": DailySchedule[];
}

export interface DailySchedule {
    videoSn: string;
    title: string;
    scheduleTime: string;
    volumeString: string;
}

export interface AniChannel {
    title: string;
    status: number;
    uploadTime: string;
    img: string;
}

export interface HotAnime {
    acgSn: string;
    animeSn: string;
    title: string;
    dcC1: string;
    dcC2: string;
    favorite: boolean;
    flag: string;
    cover: string;
    info: string;
    popular: string;
    highlightTag: HighlightTag;
}

export interface HighlightTag {
    bilingual: boolean;
    edition: string;
    vipTime: string;
}

export interface NewAdded {
    acgSn: string;
    animeSn: string;
    title: string;
    dcC1: string;
    dcC2: string;
    favorite: boolean;
    flag: string;
    cover: string;
    info: string;
    popular: string;
    highlightTag: HighlightTag;
}

export interface Category {
    title: string;
    intro: string;
    list: List[];
}

export interface List {
    acgSn: string;
    animeSn: string;
    videoSn: string;
    title: string;
    dcC1: string;
    dcC2: string;
    favorite: boolean;
    flag: string;
    cover: string;
    info: string;
    popular: string;
    highlightTag: HighlightTag;
}

export interface GnnList {
    url: string;
    title: string;
    pic: string;
}

export interface ForumList {
    url: string;
    title: string;
    pic: string;
}
