// ==UserScript==
// @name         Baha Anime Skip
// @version      0.2.1
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

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/.pnpm/wait-elm@0.1.0/node_modules/wait-elm/lib/index.js
var require_lib = __commonJS({
  "../../node_modules/.pnpm/wait-elm@0.1.0/node_modules/wait-elm/lib/index.js"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var src_exports = {};
    __export(src_exports, {
      Watcher: () => Watcher,
      wait: () => wait3,
      watcher: () => watcher
    });
    module.exports = __toCommonJS(src_exports);
    var Watcher = class {
      targets = /* @__PURE__ */ new Map();
      observing = false;
      root;
      observer;
      constructor(root = document.body) {
        this.root = root;
        this.observer = new MutationObserver(this.callback.bind(this));
      }
      callback() {
        var _a;
        for (const selector of this.targets.keys()) {
          const elm = document.querySelector(selector);
          if (elm) {
            (_a = this.targets.get(selector)) == null ? void 0 : _a[1](elm);
            if (this.targets.delete(selector) && this.targets.size === 0) {
              this.observer.disconnect();
              this.observing = false;
            }
          }
        }
      }
      async wait(selector) {
        const elm = document.querySelector(selector);
        if (elm) {
          return elm;
        }
        const exists = this.targets.get(selector);
        if (exists) {
          return exists[0];
        }
        if (this.observing === false) {
          this.observer.observe(this.root, { childList: true, subtree: true });
          this.observing = true;
        }
        const promise = new Promise((resolve) => {
          this.targets.set(selector, [Promise.resolve(this.root), resolve]);
        });
        this.targets.get(selector)[0] = promise;
        return promise;
      }
    };
    var watcher = new Watcher();
    var wait3 = watcher.wait.bind(watcher);
  }
});

// src/index.ts
var import_wait_elm2 = __toESM(require_lib(), 1);

// src/config.ts
var PREFIX = "bas-";
var config = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(PREFIX + key) || "");
    } catch {
      return localStorage.getItem(PREFIX + key);
    }
  },
  set(key, value) {
    if (typeof value === "string") {
      localStorage.setItem(PREFIX + key, value);
    } else {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    }
  }
};
if (config.get("endpoints") === null) {
  config.set("endpoints", [
    "https://jacoblin.cool/baha-anime-skip/",
    "https://jacoblincool.github.io/baha-anime-skip/",
    "https://raw.githubusercontent.com/JacobLinCool/baha-anime-skip/data/"
  ]);
}

// src/utils.ts
function debug(...contents) {
  console.log(...contents);
  const elm = document.querySelector("#baha-anime-skip-debug-console");
  if (elm) {
    elm.value += contents.join(" ").toString() + "\n";
  }
}
async function get_data(sn) {
  if (config.get("cache") === "1" && config.get(`cache-${sn}`)) {
    return JSON.parse(config.get(`cache-${sn}`));
  }
  const endpoints = config.get("endpoints");
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

// src/prefetch.ts
function prefetch_ui() {
  if (!document.querySelector("#bas-style")) {
    const style = document.createElement("style");
    style.id = "bas-style";
    style.innerHTML = `.season ul li a.bas-cached:after { content: "v"; color: orange; position: absolute; top: 0; left: 0; padding: 0 4px; }`;
    document.head.appendChild(style);
  }
}
async function prefetch_all() {
  await Promise.all(
    Array.from(document.querySelectorAll(".season ul li a")).map(
      async (elm) => {
        var _a;
        const sn = (_a = elm.href.match(/sn=(\d+)/)) == null ? void 0 : _a[1];
        if (sn && !config.get(`cache-${sn}`)) {
          try {
            await get_data(sn);
          } catch (err) {
            console.error(err);
          }
        }
      }
    )
  );
}
function prefetch_check() {
  Array.from(document.querySelectorAll(".season ul li a")).map((elm) => {
    var _a;
    const sn = (_a = elm.href.match(/sn=(\d+)/)) == null ? void 0 : _a[1];
    if (sn && config.get(`cache-${sn}`)) {
      elm.classList.add("bas-cached");
    }
  });
}

// src/tab.ts
var import_wait_elm = __toESM(require_lib(), 1);
async function add_tab() {
  var _a, _b, _c, _d, _e, _f, _g;
  const tabs = await (0, import_wait_elm.wait)(".sub_top.ani-tabs");
  const contents = await (0, import_wait_elm.wait)(".ani-tab-content");
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
  const endpoints = config.get("endpoints");
  const content = `
        <div class="ani-tab-content__item" id="${CONTENT_ID}" style="display: none; overflow: hidden auto; height: 100%">
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
                    <div class="ani-setting-label">\u555F\u7528\u5FEB\u53D6</div>
                    <div class="ani-setting-value ani-set-flex-right">
                        <div class="ani-checkbox">
                            <label class="ani-checkbox__label">
                                <input id="bas-use-cache" type="checkbox">
                                <div class="ani-checkbox__button"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="ani-setting-item ani-flex">
                    <div class="ani-setting-label">\u7CFB\u5217\u9810\u53D6</div>
                    <div class="ani-setting-value ani-set-flex-right">
                        <div class="ani-checkbox">
                            <label class="ani-checkbox__label">
                                <input id="bas-use-prefetch" type="checkbox">
                                <div class="ani-checkbox__button"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="ani-setting-item ani-flex">
                    <div class="ani-setting-label">
                        <span class="ani-setting-label__mian">\u8CC7\u6599\u5EAB\u7AEF\u9EDE</span>
                    </div>
                </div>
                <div style="display: flex; margin: 0 16px">
                    <input type="text" id="bas-endpoint" class="ani-input ani-input--keyword" placeholder="https://1.end/,https://2.end/,..." value="${endpoints.join()}">
                    <a
                        id="bas-endpoint-save"
                        href="#" 
                        role="button" 
                        class="bluebtn" 
                        style="flex: 0 0 auto; padding: 6px 12px; font-size: 12px"
                    >\u78BA\u8A8D</a>
                </div>

                <div class="ani-setting-item ani-flex">
                    <div style="width: 100%">
                        <textarea id="baha-anime-skip-debug-console" readonly class="ani-input" style="width: 100%; height: 120px; background: rgba(255, 255, 255, .1)"></textarea>
                    </div>
                </div>
            </div>
        </div>
    `;
  const dummy = document.createElement("div");
  dummy.innerHTML = content;
  const elm = dummy.firstElementChild;
  if (elm) {
    contents.appendChild(elm);
  }
  if (config.get("cache") === "1") {
    (_c = document.querySelector("#bas-use-cache")) == null ? void 0 : _c.setAttribute("checked", "");
  }
  (_d = document.querySelector("#bas-use-cache")) == null ? void 0 : _d.addEventListener("change", (e) => {
    config.set("cache", e.target.checked ? "1" : "0");
    if (e.target.checked === false) {
      Object.keys(localStorage).filter((key) => key.startsWith("bas-cache-")).forEach((key) => localStorage.removeItem(key));
    }
  });
  if (config.get("prefetch") === "1") {
    (_e = document.querySelector("#bas-use-prefetch")) == null ? void 0 : _e.setAttribute("checked", "");
  }
  (_f = document.querySelector("#bas-use-prefetch")) == null ? void 0 : _f.addEventListener("change", (e) => {
    config.set("prefetch", e.target.checked ? "1" : "0");
  });
  (_g = document.querySelector("#bas-endpoint-save")) == null ? void 0 : _g.addEventListener("click", (e) => {
    var _a2;
    const content2 = (_a2 = document.querySelector("#bas-endpoint")) == null ? void 0 : _a2.value;
    const new_endpoints = (content2 == null ? void 0 : content2.split(",").map((e2) => e2.trim()).filter((e2) => e2.length > 0)) ?? [];
    const old_endpoints = config.get("endpoints");
    if (new_endpoints.length && new_endpoints.join() !== old_endpoints.join()) {
      config.set("endpoints", new_endpoints);
      debug(`Endpoint changed from ${old_endpoints} to ${new_endpoints}`);
    }
    e.preventDefault();
  });
}

// src/button.ts
var button = create_button();
function create_button() {
  const button2 = document.createElement("button");
  Object.assign(button2.style, {
    opacity: "0",
    transition: "opacity 0.3s",
    position: "absolute",
    bottom: "50px",
    right: "0px",
    margin: "20px",
    width: "120px",
    height: "40px",
    border: "1px solid lightgray",
    borderRadius: "4px",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "white",
    fontSize: "16px",
    zIndex: "9",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    pointerEvents: "auto",
    overflow: "hidden"
  });
  return button2;
}

// src/index.ts
(async () => {
  attach().catch((err) => {
    debug(err.toString());
  }).then(() => {
    if (config.get("prefetch") === "1" && config.get("cache") === "1") {
      prefetch_ui();
      prefetch_all().then(() => {
        prefetch_check();
      });
    }
  });
  async function attach() {
    await add_tab();
    const target = await (0, import_wait_elm2.wait)("video");
    if (!target) {
      throw new Error("Cannot find video element");
    }
    const sn = new URLSearchParams(window.location.search).get("sn");
    if (!sn) {
      throw new Error("Cannot find sn in query string");
    }
    const config2 = { attributes: true, attributeFilter: ["src"] };
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
    observer.observe(target, config2);
    const data = Object.entries(await get_data(sn).catch(() => ({}))).map(
      ([chapter, [start, duration]]) => ({ chapter, start, end: start + duration })
    );
    debug("Chapters", JSON.stringify(data, null, 4));
    if (data.length === 0) {
      data.push({ chapter: "NEVT", start: 0, end: 3 });
    }
    let prev_event = null;
    let temp_disabled_event = null;
    const none = (type = "Skip button") => () => debug(`${type} clicked`);
    target.addEventListener("timeupdate", () => {
      const time = target.currentTime;
      let curr_event = null;
      for (let i = 0; i < data.length; i++) {
        if (data[i].start <= time && time <= data[i].end) {
          curr_event = data[i];
          break;
        }
      }
      if (curr_event === null && prev_event !== null) {
        debug(`Leaving ${prev_event.chapter}`);
        button.style.opacity = "0";
        button.style.pointerEvents = "none";
        button.onclick = none();
        button.oncontextmenu = none("Context menu");
        prev_event = null;
        temp_disabled_event = null;
      } else if (curr_event && curr_event !== prev_event && curr_event !== temp_disabled_event) {
        const event = curr_event;
        debug(`Entering ${event.chapter}`);
        button.style.opacity = "0.85";
        button.style.pointerEvents = "auto";
        button.innerHTML = `Skip ${event.chapter}`;
        button.onclick = () => {
          target.currentTime = event.end;
          button.onclick = none();
          button.oncontextmenu = none("Context menu");
          debug(`Skip ${event.chapter} clicked, go to ${event.end}`);
        };
        button.oncontextmenu = () => {
          debug(`Hiding ${event.chapter}`);
          temp_disabled_event = event;
          button.style.opacity = "0";
          button.style.pointerEvents = "none";
          button.onclick = none();
          button.oncontextmenu = none("Context menu");
        };
        if (event.chapter === "NEVT") {
          button.innerHTML = "\u8CA2\u737B OP \u8CC7\u8A0A";
          button.onclick = () => {
            window.open(
              "https://github.com/JacobLinCool/baha-anime-skip#readme",
              "_blank"
            );
          };
        }
        prev_event = event;
      }
    });
  }
})();
