import { config } from "./config";

export function debug(...contents: string[]): void {
    console.log(...contents);
    const elm = document.querySelector<HTMLTextAreaElement>("#baha-anime-skip-debug-console");
    if (elm) {
        elm.value += contents.join(" ").toString() + "\n";
    }
}

export async function get_data(sn: string): Promise<Record<string, [number, number]>> {
    if (config.get("cache") === "1" && config.get(`cache-${sn}`)) {
        return JSON.parse(config.get(`cache-${sn}`) as string);
    }

    const endpoints = config.get("endpoints") as string[];
    for (const endpoint of endpoints) {
        try {
            const url = `${endpoint}${sn}.json`;
            const res = await fetch(url);
            const data = await res.json();

            if (config.get("cache") === "1") {
                config.set(`cache-${sn}`, JSON.stringify(data));
            }

            return data;
        } catch (err) {
            debug(`[Not Found] ${err}`);
        }
    }

    throw new Error("All endpoints do not have this data.");
}
