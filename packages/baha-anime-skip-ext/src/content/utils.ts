export function create_report_url(): string {
    const title = document.querySelector(".anime_name > h1")?.textContent;
    const sn = new URLSearchParams(location.search).get("sn");

    const url = new URL("https://github.com/JacobLinCool/baha-anime-skip/issues/new");

    if (title && sn) {
        url.searchParams.set("title", `[資料錯誤或遺失] ${title} (${sn})`);

        const body = [
            `[動畫瘋連結](https://ani.gamer.com.tw/animeVideo.php?sn=${sn})`,
            "",
            `# 問題描述`,
            `<!-- 請將問題描述寫在此行之下 -->`,
            "",
            `# 補充資料`,
            `<!-- 如有補充資料，請補充於此行之下 -->`,
            ""
        ].join("\n");
        url.searchParams.set("body", body);
    }

    return url.toString();
}