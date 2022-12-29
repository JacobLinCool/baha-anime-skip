const PREFIX = "bas-";

const config = {
    get(key: string): unknown | null {
        try {
            return JSON.parse(localStorage.getItem(PREFIX + key) || "");
        } catch {
            return localStorage.getItem(PREFIX + key);
        }
    },
    set(key: string, value: unknown): void {
        if (typeof value === "string") {
            localStorage.setItem(PREFIX + key, value);
        } else {
            localStorage.setItem(PREFIX + key, JSON.stringify(value));
        }
    },
};

if (config.get("endpoints") === null) {
    config.set("endpoints", [
        "https://jacoblin.cool/baha-anime-skip/",
        "https://jacoblincool.github.io/baha-anime-skip/",
        "https://raw.githubusercontent.com/JacobLinCool/baha-anime-skip/data/",
    ]);
}

export { config };
