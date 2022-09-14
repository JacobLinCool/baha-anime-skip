const PREFIX = "bas-";

const config = {
    get(key: string): string | null {
        return localStorage.getItem(PREFIX + key);
    },
    set(key: string, value: string): void {
        localStorage.setItem(PREFIX + key, value);
    },
};

if (config.get("endpoint") === null) {
    config.set("endpoint", "https://jacoblincool.github.io/baha-anime-skip/");
}

export { config };
