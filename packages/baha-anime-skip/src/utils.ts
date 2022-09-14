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
