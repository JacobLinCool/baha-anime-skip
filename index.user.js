// ==UserScript==
// @name         Baha Anime Skip
// @version      0.1.0
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


// src/index.ts
(async () => {
  document.body.addEventListener("click", attach, { once: true });
  async function attach() {
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
      await get_data(sn)
    ).map(([chapter, [start, duration]]) => ({ chapter, start, end: start + duration }));
    console.log("Chapters", JSON.stringify(data, null, 4));
    target.addEventListener("timeupdate", () => {
      const time = target.currentTime;
      let has_event = false;
      for (let i = 0; i < data.length; i++) {
        if (data[i].start <= time && time <= data[i].end) {
          button.style.opacity = "1";
          button.innerHTML = `Skip ${data[i].chapter}`;
          button.onclick = () => {
            target.currentTime = data[i].end;
            button.style.opacity = "0";
            button.onclick = () => {
              console.log("Skip button clicked");
            };
          };
          has_event = true;
          break;
        }
      }
      if (!has_event) {
        button.style.opacity = "0";
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
    button.innerHTML = "Skip";
    return button;
  }
  async function get_data(sn) {
    const url = `https://jacoblincool.github.io/baha-anime-skip/${sn}.json`;
    const res = await fetch(url);
    const data = await res.json();
    return data;
  }
})();
