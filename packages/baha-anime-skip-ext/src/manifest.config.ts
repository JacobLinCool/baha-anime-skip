import { defineManifest } from "@crxjs/vite-plugin";
import package_json from "../package.json";

const { version, displayName, description } = package_json;

export default defineManifest(async () => ({
    manifest_version: 3,
    name: displayName,
    description: description,
    version: version,
    version_name: version,
    icons: {
        "16": "src/assets/icons/icon-16.png",
        "32": "src/assets/icons/icon-32.png",
        "48": "src/assets/icons/icon-48.png",
        "128": "src/assets/icons/icon-128.png",
    },
    content_scripts: [
        {
            matches: ["https://ani.gamer.com.tw/animeVideo.php?*"],
            js: ["src/content/index.ts"],
        },
    ],
    background: {
        service_worker: "src/background/index.ts",
    },
    permissions: ["storage"] as chrome.runtime.ManifestPermissions[],
}));
