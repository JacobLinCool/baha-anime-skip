// ==UserScript==
// @name         Baha Anime Skip
// @version      0.1.3
// @description  Skip OP or other things on Bahamut Anime.
// @author       JacobLinCool <jacoblincool@gmail.com> (https://github.com/JacobLinCool)
// @license      MIT
// @homepage     https://github.com/JacobLinCool/baha-anime-skip#readme
// @supportURL   https://github.com/JacobLinCool/baha-anime-skip/issues
// @updateURL    https://raw.githubusercontent.com/JacobLinCool/baha-anime-skip/dist/index.user.js
// @downloadURL  https://raw.githubusercontent.com/JacobLinCool/baha-anime-skip/dist/index.user.js
// @namespace    http://tampermonkey.net/
// @match        https://ani.gamer.com.tw/animeVideo.php?sn=*
// @icon         https://www.google.com/s2/favicons?domain=gamer.com.tw
// @grant        none
// ==/UserScript==


// src/tab.ts
function add_tab() {
  var _a, _b;
  const tabs = document.querySelector(".sub_top.ani-tabs");
  const contents = document.querySelector(".ani-tab-content");
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
  (_a = document.querySelector(`a[href="#${CONTENT_ID}"]`)) == null ? void 0 : _a.addEventListener("click", (e) => {
    var _a2;
    (_a2 = document.querySelector(".ani-tabs-link.is-active")) == null ? void 0 : _a2.classList.remove("is-active");
    e.target.classList.add("is-active");
    document.querySelectorAll(".ani-tab-content__item").forEach((item) => {
      item.style.display = "none";
    });
    const content2 = document.querySelector(`#${CONTENT_ID}`);
    if (content2) {
      content2.style.display = "block";
    }
    e.preventDefault();
  });
  const issue_title = `[\u8CC7\u6599\u932F\u8AA4\u6216\u907A\u5931] ${(_b = document.title.match(/(.+?\[.+?\])/)) == null ? void 0 : _b[1]} (${new URLSearchParams(location.search).get("sn")})`;
  const issue_body = `[\u52D5\u756B\u760B\u9023\u7D50](${location.href})

# \u554F\u984C\u63CF\u8FF0
<!-- \u8ACB\u5C07\u554F\u984C\u63CF\u8FF0\u5BEB\u5728\u6B64\u884C\u4E4B\u4E0B -->

# \u88DC\u5145\u8CC7\u6599
<!-- \u5982\u6709\u88DC\u5145\u8CC7\u6599\uFF0C\u8ACB\u88DC\u5145\u65BC\u6B64\u884C\u4E4B\u4E0B -->
`;
  const content = `
        <div class="ani-tab-content__item" id="${CONTENT_ID}" style="display: none">
            <div class="ani-setting-section">
                <h4 class="ani-setting-title">Skip</h4>
                <div class="ani-setting-item ani-flex">
                    <div class="ani-setting-label">
                        <span class="ani-setting-label__mian">\u901A\u5831\u8CC7\u6599\u932F\u8AA4\u6216\u907A\u5931</span>
                    </div>
                    <div class="ani-setting-value ani-set-flex-right">
                        <div>
                            <a href="https://github.com/JacobLinCool/baha-anime-skip/issues/new?title=${encodeURIComponent(
    issue_title
  )}&body=${encodeURIComponent(
    issue_body
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

// src/index.ts
(async () => {
  const endpoint = localStorage.getItem("anime-skip-endpoint") || "https://jacoblincool.github.io/baha-anime-skip/";
  window.addEventListener("load", () => attach().catch(debug), {
    once: true
  });
  async function attach() {
    add_tab();
    const target = document.querySelector("video");
    if (!target) {
      throw new Error("Cannot find video element");
    }
    const sn = new URLSearchParams(window.location.search).get("sn");
    if (!sn) {
      throw new Error("Cannot find sn in query string");
    }
    const button = create_button();
    const config = { attributes: true, attributeFilter: ["src"] };
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "src") {
          target.addEventListener("loadedmetadata", () => {
            const videojs = document.querySelector("video-js");
            if (videojs) {
              videojs.appendChild(button);
            }
          });
        }
      });
    });
    observer.observe(target, config);
    const data = Object.entries(
      await get_data(sn).catch(() => ({}))
    ).map(([chapter, [start, duration]]) => ({ chapter, start, end: start + duration }));
    console.log("Chapters", JSON.stringify(data, null, 4));
    debug(JSON.stringify(data, null, 4));
    if (data.length === 0) {
      data.push({ chapter: "NEVT", start: 0, end: 3 });
    }
    const none = () => debug("Skip button clicked");
    target.addEventListener("timeupdate", () => {
      const time = target.currentTime;
      let has_event = false;
      for (let i = 0; i < data.length; i++) {
        if (data[i].start <= time && time <= data[i].end) {
          button.style.opacity = "1";
          button.innerHTML = `Skip ${data[i].chapter}`;
          button.onclick = () => {
            target.currentTime = data[i].end;
            button.onclick = none;
            debug(`Skip ${data[i].chapter} clicked, go to ${data[i].end}`);
          };
          has_event = true;
          if (data[i].chapter === "NEVT") {
            button.innerHTML = "\u8CA2\u737B OP \u8CC7\u8A0A";
            button.onclick = () => {
              window.open(
                "https://github.com/JacobLinCool/baha-anime-skip#readme",
                "_blank"
              );
            };
          }
          break;
        }
      }
      if (!has_event) {
        button.style.opacity = "0";
        button.onclick = none;
      }
    });
  }
  function create_button() {
    const button = document.createElement("button");
    button.style.opacity = "0";
    button.style.transition = "opacity 0.3s";
    button.style.position = "absolute";
    button.style.bottom = "50px";
    button.style.right = "0px";
    button.style.margin = "20px";
    button.style.width = "120px";
    button.style.height = "40px";
    button.style.border = "1px solid lightgray";
    button.style.borderRadius = "4px";
    button.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    button.style.color = "white";
    button.style.fontSize = "16px";
    button.style.zIndex = "999";
    button.style.justifyContent = "center";
    button.style.alignItems = "center";
    button.style.cursor = "pointer";
    button.style.pointerEvents = "auto";
    button.style.overflow = "hidden";
    button.innerHTML = "Skip";
    return button;
  }
  async function get_data(sn) {
    const url = `${endpoint}${sn}.json`;
    const res = await fetch(url);
    const data = await res.json();
    return data;
  }
  function debug(content) {
    const elm = document.querySelector("#baha-anime-skip-debug-console");
    if (elm) {
      elm.value += content.toString() + "\n";
    }
  }
})();
