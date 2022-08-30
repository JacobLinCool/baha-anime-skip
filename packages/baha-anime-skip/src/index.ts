document.body.addEventListener("click", () => {
    attach();
});

async function attach() {
    const target = document.querySelector("video");
    if (!target) {
        throw new Error("Cannot find video element");
    }

    const sn = new URLSearchParams(window.location.search).get("sn");
    if (!sn) {
        throw new Error("Cannot find sn in query string");
    }

    const data = await get_data(sn);
    console.log(data);

    const config = { attributes: true, attributeFilter: ["src"] };
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === "src") {
                target.addEventListener("loadedmetadata", () => {
                    const videojs = document.querySelector<HTMLDivElement>("video-js");

                    if (videojs) {
                        const button = create_button();
                        videojs.appendChild(button);
                    }
                });
            }
        });
    });
    observer.observe(target, config);
}

function create_button(): HTMLButtonElement {
    const button = document.createElement("button");

    button.style.display = "none";
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

    button.innerText = "Skip";

    return button;
}

async function get_data(sn: string): Promise<Record<string, [number, number]>> {
    const url = `https://raw.githubusercontent.com/jacoblincool/baha-anime-skip/data/${sn}.json`;
    const res = await fetch(url);
    const data = await res.json();
    return data;
}
