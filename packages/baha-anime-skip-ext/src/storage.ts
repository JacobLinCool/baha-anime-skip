import { log as base_log } from "./log";

const log = base_log.extend("storage");
log.enabled = true;

export interface SkipStorage {
    endpoints: string[];
}

const default_storage: SkipStorage = {
    endpoints: [
        "https://jacoblincool.github.io/baha-anime-skip/",
        "https://raw.githubusercontent.com/JacobLinCool/baha-anime-skip/data/",
    ],
};

export const storage = {
    get: async (): Promise<SkipStorage> => {
        log("getting storage");
        const storage = (await chrome.storage.sync.get(default_storage)) as Promise<SkipStorage>;
        log("got storage", storage);
        return storage;
    },
    set: async (value: Partial<SkipStorage>): Promise<void> => {
        log("setting storage", value);
        await chrome.storage.sync.set(value);
        log("set storage");
    },
};
