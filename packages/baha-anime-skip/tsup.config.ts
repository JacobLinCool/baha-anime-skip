import { defineConfig } from "tsup";
import PACKAGE from "./package.json";

const banner = `// ==UserScript==
// @name         Baha Anime Skip
// @version      ${PACKAGE.version}
// @description  ${PACKAGE.description}
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
`;

export default defineConfig(() => ({
    entry: ["src/index.ts"],
    outDir: "dist",
    target: "node16",
    format: ["esm"],
    clean: true,
    splitting: false,
    banner: () => ({
        js: banner,
    }),
    outExtension: (ctx) => {
        return { js: ".user.js" };
    },
}));
