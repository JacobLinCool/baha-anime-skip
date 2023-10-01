import { log } from "../log";

export interface Tab {
    name: string;
    mount: (target: HTMLDivElement) => void | Promise<void>;
    unmount: () => void | Promise<void>;
}

export class TabManager {
    protected nav = document.querySelector(".ani-tabs");
    protected wrapper = document.querySelector(".ani-tab-content");
    protected tabs: {
        data: Tab;
        target: HTMLDivElement;
        nav: HTMLDivElement;
    }[] = [];

    constructor() {
        if (!this.nav || !this.wrapper) {
            throw new Error("Cannot find nav or wrapper");
        }

        [...this.nav.children].forEach((tab) => {
            const link = tab.querySelector("a");
            const name = link?.innerText;
            const id = "#" + link?.href.split("#")[1];
            const target = document.querySelector<HTMLDivElement>(id);
            log("attaching other tabs", { link, name, id, target });
            if (name && target) {
                this.tabs.push({
                    data: { name, mount: () => { }, unmount: () => { } },
                    target,
                    nav: tab as HTMLDivElement,
                });
                log("attached other tabs", { name });
            }
        });

        this.hide_all();
        this.show(this.tabs[0]);
    }

    protected hide_all(): void {
        if (!this.wrapper) {
            throw new Error("Cannot find wrapper");
        }

        [...this.wrapper.children].forEach((child) => {
            if (child instanceof HTMLElement) {
                child.style.display = "none";
            }
        });

        this.tabs.forEach((tab) => {
            tab.nav.querySelector("a")?.classList.remove("is-active");
        });
    }

    protected show(tab: { data: Tab; target: HTMLDivElement; nav: HTMLDivElement }): void {
        tab.target.style.display = "block";
        tab.nav.querySelector("a")?.classList.add("is-active");
    }

    public async add(tab: Tab): Promise<void> {
        if (!this.wrapper || !this.nav) {
            throw new Error("Cannot find wrapper or nav");
        }

        const target = document.createElement("div");
        target.id = `baha-anime-tab-${tab.name}`;
        target.classList.add("ani-tabs__item");
        this.wrapper.appendChild(target);

        const nav = document.createElement("div");
        nav.classList.add("ani-tab-nav");

        const t = { data: tab, target, nav };

        const link = document.createElement("a");
        link.href = `#baha-anime-tab-${tab.name}`;
        link.classList.add("ani-tabs-link");
        link.innerText = tab.name;
        link.addEventListener("click", (evt) => {
            evt.preventDefault();
            this.hide_all();
            this.show(t);
        });
        nav.appendChild(link);
        this.nav.appendChild(nav);

        this.tabs.push(t);
        await tab.mount(target);
    }

    public async remove(tab: Tab): Promise<void> {
        if (!this.wrapper || !this.nav) {
            throw new Error("Cannot find wrapper or nav");
        }

        const index = this.tabs.findIndex((t) => t.data === tab);
        if (index === -1) {
            throw new Error("Tab not found");
        }

        const { target, nav } = this.tabs[index];
        await tab.unmount();
        this.wrapper.removeChild(target);
        this.nav.removeChild(nav);
        this.tabs.splice(index, 1);
    }

    static attachable(): boolean {
        const ok =
            !!document.querySelector(".ani-tabs") && !!document.querySelector(".ani-tab-content");
        return ok;
    }
}
