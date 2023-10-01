import { log } from "../log";
import { TabManager } from "./manager";
import "../styles.css";
import { mount } from "./mount";

if (TabManager.attachable()) {
    attach();
} else {
    document.body.addEventListener("DOMContentLoaded", attach);
}

function attach() {
    log("attach");
    const manager = new TabManager();

    manager.add({
        name: "Skip",
        mount,
        unmount: () => { },
    });
    log("attached");
}
