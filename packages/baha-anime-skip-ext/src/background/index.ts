import { storage } from "../storage";

// Background service workers
// https://developer.chrome.com/docs/extensions/mv3/service_workers/

chrome.runtime.onInstalled.addListener(() => {
    storage.get().then(console.log);
});
