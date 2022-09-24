import { config } from "./config";
import { get_data } from "./utils";

export function prefetch_ui(): void {
    if (!document.querySelector("#bas-style")) {
        const style = document.createElement("style");
        style.id = "bas-style";
        style.innerHTML = `.season ul li a.bas-cached:after { content: "v"; color: orange; position: absolute; top: 0; left: 0; padding: 0 4px; }`;
        document.head.appendChild(style);
    }
}

export async function prefetch_all(): Promise<void> {
    await Promise.all(
        Array.from(document.querySelectorAll<HTMLAnchorElement>(".season ul li a")).map(
            async (elm) => {
                const sn = elm.href.match(/sn=(\d+)/)?.[1];
                if (sn && !config.get(`cache-${sn}`)) {
                    try {
                        await get_data(sn);
                    } catch (err) {
                        console.error(err);
                    }
                }
            },
        ),
    );
}

export function prefetch_check(): void {
    Array.from(document.querySelectorAll<HTMLAnchorElement>(".season ul li a")).map((elm) => {
        const sn = elm.href.match(/sn=(\d+)/)?.[1];
        if (sn && config.get(`cache-${sn}`)) {
            elm.classList.add("bas-cached");
        }
    });
}
