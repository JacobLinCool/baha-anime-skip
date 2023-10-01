import SkipTab from "../components/SkipTab.svelte";
import SkipButton from "../components/SkipButton.svelte";
import { log as base_log } from "../log";
import { storage } from "../storage";
import { wait } from "wait-elm";

const log = base_log.extend("mount");
log.enabled = true;

export async function mount(target: HTMLDivElement): Promise<void> {
    new SkipTab({ target });
    log("mounted skip tab");

    const endpoints = (await storage.get()).endpoints;

    const video = await wait("video");
    if (!video) {
        throw new Error("Cannot find video element");
    }

    const sn = new URLSearchParams(window.location.search).get("sn");
    if (!sn) {
        throw new Error("Cannot find sn in query string");
    }

    try {
        const data = fetch_data(sn, endpoints);

        const config = { attributes: true, attributeFilter: ["src"] };
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "src") {
                    video.addEventListener("loadedmetadata", () => {
                        const videojs = document.querySelector<HTMLDivElement>("video-js");

                        if (videojs) {
                            const button = document.createElement("div");
                            button.style.display = "contents";
                            videojs.appendChild(button);

                            data.then((raw) => {
                                log("data", raw);

                                const data = Object.entries(raw).map(
                                    ([chapter, [start, duration]]) => ({
                                        chapter, start, end: start + duration
                                    }),
                                );

                                if (data.length === 0) {
                                    data.push({ chapter: "NEVT", start: 0, end: 3 });
                                }

                                new SkipButton({
                                    target: button,
                                    props: { data, video },
                                });
                            });
                        }
                    });
                }
            });
        });
        observer.observe(video, config);
    } catch (err) {
        log(err);
    }
}

async function fetch_data(sn: string, endpoints: string[]): Promise<Record<string, [number, number]>> {
    log("fetching data", { sn, endpoints });
    for (const endpoint of endpoints) {
        try {
            const url = `${endpoint}${sn}.json`;
            const res = await fetch(url, { redirect: "follow" });
            const data = await res.json();

            return data;
        } catch (err) {
            log(`[Not Found] ${endpoint} ${err}`);
        }
    }

    throw new Error("All endpoints do not have this data.");
}
