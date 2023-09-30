import { wait } from "wait-elm";
import { button } from "./button";
import { config } from "./config";
import { prefetch_all, prefetch_check, prefetch_ui } from "./prefetch";
import { add_tab } from "./tab";
import { Event } from "./types";
import { debug, get_data } from "./utils";

(async () => {
    attach()
        .catch((err) => {
            debug(err.toString());
        })
        .then(() => {
            if (config.get("prefetch") === "1" && config.get("cache") === "1") {
                prefetch_ui();
                prefetch_all().then(() => {
                    prefetch_check();
                });
            }
        });

    async function attach() {
        await add_tab();

        const target = await wait("video");
        if (!target) {
            throw new Error("Cannot find video element");
        }

        const sn = new URLSearchParams(window.location.search).get("sn");
        if (!sn) {
            throw new Error("Cannot find sn in query string");
        }

        const config = { attributes: true, attributeFilter: ["src"] };
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "src") {
                    target.addEventListener("loadedmetadata", () => {
                        const videojs = document.querySelector<HTMLDivElement>("video-js");

                        if (videojs) {
                            videojs.appendChild(button);
                        }
                    });
                }
            });
        });
        observer.observe(target, config);

        const data: Event[] = Object.entries(await get_data(sn).catch(() => ({}))).map(
            ([chapter, [start, duration]]) => ({ chapter, start, end: start + duration }),
        );
        debug("Chapters", JSON.stringify(data, null, 4));

        if (data.length === 0) {
            data.push({ chapter: "NEVT", start: 0, end: 3 });
        }

        let prev_event: Event | null = null;
        let temp_disabled_event: Event | null = null;

        const none =
            (type = "Skip button") =>
            () =>
                debug(`${type} clicked`);
        target.addEventListener("timeupdate", () => {
            const time = target.currentTime;

            let curr_event: Event | null = null;
            for (let i = 0; i < data.length; i++) {
                if (data[i].start <= time && time <= data[i].end) {
                    curr_event = data[i];
                    break;
                }
            }

            if (curr_event === null && prev_event !== null) {
                debug(`Leaving ${prev_event.chapter}`);
                button.style.opacity = "0";
                button.style.pointerEvents = "none";
                button.onclick = none();
                button.oncontextmenu = none("Context menu");
                prev_event = null;
                temp_disabled_event = null;
            } else if (
                curr_event &&
                curr_event !== prev_event &&
                curr_event !== temp_disabled_event
            ) {
                const event = curr_event;
                debug(`Entering ${event.chapter}`);

                button.style.opacity = "0.85";
                button.style.pointerEvents = "auto";
                button.innerHTML = `Skip ${event.chapter}`;

                button.onclick = () => {
                    target.currentTime = event.end;
                    button.onclick = none();
                    button.oncontextmenu = none("Context menu");
                    debug(`Skip ${event.chapter} clicked, go to ${event.end}`);
                };

                button.oncontextmenu = () => {
                    debug(`Hiding ${event.chapter}`);
                    temp_disabled_event = event;
                    button.style.opacity = "0";
                    button.style.pointerEvents = "none";
                    button.onclick = none();
                    button.oncontextmenu = none("Context menu");
                };

                if (event.chapter === "NEVT") {
                    button.innerHTML = "貢獻 OP 資訊";
                    button.onclick = () => {
                        window.open(
                            "https://github.com/JacobLinCool/baha-anime-skip#readme",
                            "_blank",
                        );
                    };
                }

                prev_event = event;
            }
        });
    }
})();
