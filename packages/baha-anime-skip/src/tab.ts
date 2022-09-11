export function add_tab(): void {
    const tabs = document.querySelector(".sub_top.ani-tabs") as HTMLDivElement;
    const contents = document.querySelector(".ani-tab-content") as HTMLDivElement;

    const CONTENT_ID = "baha-anime-skip-content";

    const tab = `
        <div id="cm-settings" class="ani-tabs__item">
            <a class="ani-tabs-link" href="#${CONTENT_ID}">
                Skip
            </a>
        </div>
    `;

    const tab_elm = document.createElement("div");
    tab_elm.innerHTML = tab;
    tabs.appendChild(tab_elm);

    document.querySelector(`a[href="#${CONTENT_ID}"]`)?.addEventListener("click", (e) => {
        document.querySelector(".ani-tabs-link.is-active")?.classList.remove("is-active");
        (e.target as HTMLDivElement).classList.add("is-active");
        document.querySelectorAll<HTMLDivElement>(".ani-tab-content__item").forEach((item) => {
            item.style.display = "none";
        });

        const content = document.querySelector<HTMLDivElement>(`#${CONTENT_ID}`);
        if (content) {
            content.style.display = "block";
        }
        e.preventDefault();
    });

    const issue_title = `[資料錯誤或遺失] ${
        document.title.match(/(.+?\[.+?\])/)?.[1]
    } (${new URLSearchParams(location.search).get("sn")})`;
    const issue_body = `[動畫瘋連結](${location.href})\n\n# 問題描述\n<!-- 請將問題描述寫在此行之下 -->\n\n# 補充資料\n<!-- 如有補充資料，請補充於此行之下 -->\n`;

    const content = `
        <div class="ani-tab-content__item" id="${CONTENT_ID}" style="display: none">
            <div class="ani-setting-section">
                <h4 class="ani-setting-title">Skip</h4>
                <div class="ani-setting-item ani-flex">
                    <div class="ani-setting-label">
                        <span class="ani-setting-label__mian">通報資料錯誤或遺失</span>
                    </div>
                    <div class="ani-setting-value ani-set-flex-right">
                        <div>
                            <a href="https://github.com/JacobLinCool/baha-anime-skip/issues/new?title=${encodeURIComponent(
                                issue_title,
                            )}&body=${encodeURIComponent(
        issue_body,
    )}" target="_blank" style="color: #54c3e0">GitHub Issues</a>
                        </div>
                    </div>
                </div>
                <div class="ani-setting-item ani-flex">
                    <div style="width: 100%">
                        <textarea id="baha-anime-skip-debug-console" readonly style="width: 100%; height: 120px"></textarea>
                    </div>
                </div>
            </div>
        </div>
    `;

    const content_elm = document.createElement("div");
    content_elm.innerHTML = content;
    contents.appendChild(content_elm);
}
