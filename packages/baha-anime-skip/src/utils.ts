import { config } from "./config";

export function wait<K extends keyof HTMLElementTagNameMap>(
    selector: K,
    parent?: HTMLElement,
): Promise<HTMLElementTagNameMap[K]>;
export function wait<E extends Element = Element>(
    selectors: string,
    parent?: HTMLElement,
): Promise<E>;
export function wait<K extends keyof HTMLElementTagNameMap>(
    selector: K,
    parent = document.body,
): Promise<HTMLElementTagNameMap[K]> {
    return new Promise((resolve) => {
        const elm = document.querySelector<HTMLElementTagNameMap[K]>(selector);
        if (elm) {
            resolve(elm);
            return;
        }

        const observer = new MutationObserver(() => {
            const elm = document.querySelector<HTMLElementTagNameMap[K]>(selector);
            if (elm) {
                observer.disconnect();
                resolve(elm);
            }
        });

        observer.observe(parent, { childList: true, subtree: true });
    });
}

export function debug(content: string): void {
    const elm = document.querySelector<HTMLTextAreaElement>("#baha-anime-skip-debug-console");
    if (elm) {
        elm.value += content.toString() + "\n";
    }
}

export async function get_data(sn: string): Promise<Record<string, [number, number]>> {
    if (config.get("cache") === "1" && config.get(`cache-${sn}`)) {
        return JSON.parse(config.get(`cache-${sn}`) as string);
    }

    const url = `${config.get("endpoint")}${sn}.json`;
    const res = await fetch(url);
    const data = await res.json();

    if (config.get("cache") === "1") {
        config.set(`cache-${sn}`, JSON.stringify(data));
    }

    return data;
}
