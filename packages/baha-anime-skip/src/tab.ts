export function add_tab(): void {
    const tabs = document.querySelector(".sub_top.ani-tabs") as HTMLDivElement;
    const contents = document.querySelector(".ani-tab-content") as HTMLDivElement;

    const CONTENT_ID = "baha-anime-skip-content";

    const tab = `<div id="cm-settings" class="ani-tabs__item">
            <a class="ani-tabs-link" href="#${CONTENT_ID}">
                Skip
            </a>
        </div>
    )`;

    tabs.innerHTML += tab;

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

    const content = `
        <div class="ani-tab-content__item" id="${CONTENT_ID}" style="display: none">
            <div class="ani-setting-section">
                <h4 class="ani-setting-title">山脈設定</h4>
                <div class="ani-setting-item ani-flex">
                    <div class="ani-setting-label">
                        <span class="ani-setting-label__mian">持續顯示</span>
                    </div>
                    <div class="ani-setting-value ani-set-flex-right">
                        <div class="ani-checkbox">
                            <label class="ani-checkbox__label">
                                <input
                                    id="cm-always"
                                    type="checkbox"
                                    name="ani-checkbox"
                                    checked={cfg.always}
                                    onChange={(e) => {
                                        window.cm.always = e.target.checked;
                                    }}
                                ></input>
                                <div class="ani-checkbox__button"></div>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="ani-setting-item ani-flex">
                    <div class="ani-setting-label">
                        <span class="ani-setting-label__mian">彩色顯示</span>
                    </div>
                    <div class="ani-setting-value ani-set-flex-right">
                        <div class="ani-checkbox">
                            <label class="ani-checkbox__label">
                                <input
                                    id="cm-colorful"
                                    type="checkbox"
                                    name="ani-checkbox"
                                    checked={cfg.colorful}
                                    onChange={(e) => {
                                        window.cm.colorful = e.target.checked;
                                    }}
                                ></input>
                                <div class="ani-checkbox__button"></div>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="ani-setting-item ani-flex">
                    <div class="ani-setting-label">
                        <span class="ani-setting-label__mian">不透明度</span>
                        <span class="ani-setting-label__sub" id="cm-opacity-label">
                            {cfg.opacity * 100}%
                        </span>
                    </div>
                    <div class="ani-setting-value ani-set-flex-right">
                        <div class="ani-range" id="cm-opacity-range">
                            <input
                                type="range"
                                id="cm-opacity"
                                max="100"
                                min="10"
                                step="10"
                                value={cfg.opacity * 100}
                                onChange={(e) => {
                                    window.cm.opacity = parseInt(e.target.value) / 100;
                                    document.querySelector("#cm-opacity-label").innerText =
                                        e.target.value + "%";
                                }}
                            ></input>
                        </div>
                    </div>
                </div>
                <div class="ani-setting-item ani-flex">
                    <div class="ani-setting-label">
                        <span class="ani-setting-label__mian">熱度閥值</span>
                        <span class="ani-setting-label__sub" id="cm-threshold-label">
                            {cfg.threshold}
                        </span>
                    </div>
                    <div class="ani-setting-value ani-set-flex-right">
                        <div class="ani-range" id="cm-threshold-input">
                            <input
                                type="number"
                                id="cm-threshold"
                                max="1000"
                                min="0"
                                step="10"
                                value={cfg.threshold}
                                onChange={(e) => {
                                    window.cm.threshold = parseInt(e.target.value);
                                    document.querySelector("#cm-threshold-label").innerText =
                                        e.target.value;
                                }}
                            ></input>
                        </div>
                    </div>
                </div>
                <div class="ani-setting-item ani-flex">
                    <div class="ani-setting-label">
                        <span class="ani-setting-label__mian">切片大小</span>
                        <span class="ani-setting-label__sub" id="cm-segments-label">
                            {cfg.segments}
                        </span>
                    </div>
                    <div class="ani-setting-value ani-set-flex-right">
                        <div class="ani-range" id="cm-segments-input">
                            <input
                                type="number"
                                id="cm-segments"
                                max="1000"
                                min="0"
                                step="10"
                                value={cfg.segments}
                                onChange={(e) => {
                                    window.cm.segments = parseInt(e.target.value);
                                    document.querySelector("#cm-segments-label").innerText =
                                        e.target.value;
                                }}
                            ></input>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                #${CONTENT_ID} input[type="number"] {"{"}
                border: none; color: #54c3e0; font-size: 2rem; text-align: right; {"}"}
            </style>
        </div>
    `;

    contents.innerHTML += content;
}
