import { MultiTerm, Term } from "multi-term";
import update from "log-update";

export const multi_term = new MultiTerm(3, 100);
export const console_term = new Term("Console");
let lazy_update: null | NodeJS.Timeout = null;

multi_term.on("stdout", () => {
    if (lazy_update) {
        return;
    }

    lazy_update = setTimeout(() => {
        lazy_update = null;
        update(multi_term.mixed);
    }, 500);
});
multi_term.add(console_term);
