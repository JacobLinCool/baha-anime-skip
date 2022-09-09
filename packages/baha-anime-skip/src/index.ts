(async () => {
    const endpoint =
        localStorage.getItem("anime-skip-endpoint") ||
        "https://jacoblincool.github.io/baha-anime-skip/";

    document.body.addEventListener("click", attach, { once: true });

    async function attach() {
        const target = document.querySelector("video");
        if (!target) {
            throw new Error("Cannot find video element");
        }

        const sn = new URLSearchParams(window.location.search).get("sn");
        if (!sn) {
            throw new Error("Cannot find sn in query string");
        }

        const button = create_button();

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

        const data: { chapter: string; start: number; end: number }[] = Object.entries(
            await get_data(sn).catch(() => ({})),
        ).map(([chapter, [start, duration]]) => ({ chapter, start, end: start + duration }));
        console.log("Chapters", JSON.stringify(data, null, 4));

        if (data.length === 0) {
            data.push({ chapter: "NEVT", start: 0, end: 3 });
        }

        const none = () => console.log("Skip button clicked");
        target.addEventListener("timeupdate", () => {
            const time = target.currentTime;

            let has_event = false;
            for (let i = 0; i < data.length; i++) {
                if (data[i].start <= time && time <= data[i].end) {
                    button.style.opacity = "1";
                    button.innerHTML = `Skip ${data[i].chapter}`;

                    button.onclick = () => {
                        target.currentTime = data[i].end;
                        button.onclick = none;
                    };
                    has_event = true;

                    if (data[i].chapter === "NEVT") {
                        button.innerHTML = "貢獻 OP 資訊";
                        button.onclick = () => {
                            window.open(
                                "https://github.com/JacobLinCool/baha-anime-skip#readme",
                                "_blank",
                            );
                        };
                    }

                    break;
                }
            }

            if (!has_event) {
                button.style.opacity = "0";
                button.onclick = none;
            }
        });
    }

    function create_button(): HTMLButtonElement {
        const button = document.createElement("button");

        button.style.opacity = "0";
        button.style.transition = "opacity 0.3s";
        button.style.position = "absolute";
        button.style.bottom = "50px";
        button.style.right = "0px";
        button.style.margin = "20px";
        button.style.width = "120px";
        button.style.height = "40px";
        button.style.border = "1px solid lightgray";
        button.style.borderRadius = "4px";
        button.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        button.style.color = "white";
        button.style.fontSize = "16px";
        button.style.zIndex = "999";
        button.style.justifyContent = "center";
        button.style.alignItems = "center";
        button.style.cursor = "pointer";
        button.style.pointerEvents = "auto";
        button.style.overflow = "hidden";

        button.innerHTML = "Skip";

        return button;
    }

    async function get_data(sn: string): Promise<Record<string, [number, number]>> {
        const url = `${endpoint}${sn}.json`;
        const res = await fetch(url);
        const data = await res.json();
        return data;
    }
})();
