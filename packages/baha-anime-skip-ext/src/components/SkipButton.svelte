<script lang="ts">
    import { create_report_url } from "../content/utils";
    import { log as base_log } from "../log";

    const log = base_log.extend("button");
    log.enabled = true;

    interface Event {
        chapter: string;
        start: number;
        end: number;
    }

    export let data: Event[];
    export let video: HTMLVideoElement;

    let show_button = false;
    let content = "";

    let prev_event: Event | null = null;
    let temp_disabled_event: Event | null = null;

    let button: HTMLButtonElement;

    video.addEventListener("timeupdate", () => {
        const time = video.currentTime;

        let curr_event: Event | null = null;
        for (let i = 0; i < data.length; i++) {
            if (data[i].start <= time && time <= data[i].end) {
                curr_event = data[i];
                break;
            }
        }

        if (curr_event === null && prev_event !== null) {
            log(`Leaving ${prev_event.chapter}`);
            show_button = false;
            button.onclick = none();
            button.oncontextmenu = none("Context menu");
            prev_event = null;
            temp_disabled_event = null;
        } else if (curr_event && curr_event !== prev_event && curr_event !== temp_disabled_event) {
            const event = curr_event;
            log(`Entering ${event.chapter}`);

            show_button = true;
            content = `Skip ${event.chapter}`;

            button.onclick = () => skip_chapter(event);
            button.oncontextmenu = () => hide_button(event);

            if (event.chapter === "NEVT") {
                content = "貢獻 OP 資訊";
                button.onclick = () => {
                    const report_url = create_report_url();
                    window.open(report_url, "_blank");
                };
            }

            prev_event = event;
        }
    });

    function none(type = "Skip Button") {
        return () => log(`${type} clicked`);
    }

    function skip_chapter(event: Event) {
        video.currentTime = event.end;
        button.onclick = none();
        button.oncontextmenu = none("Context Menu");
        log(`Skip ${event.chapter} clicked, go to ${event.end}`);
    }

    function hide_button(event: Event) {
        temp_disabled_event = event;
        log(`Hide ${event.chapter}`);
        show_button = false;
        button.onclick = none();
        button.oncontextmenu = none("Context Menu");
    }
</script>

<button
    style="
    transition: opacity 0.3s;
    position: absolute;
    bottom: 50px;
    right: 0px;
    margin: 20px;
    width: 120px;
    height: 40px;
    border: 1px solid lightgray;
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 16px;
    z-index: 9;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    overflow: hidden;
    "
    style:opacity={show_button ? 0.85 : 0}
    style:pointer-events={show_button ? "auto" : "none"}
    bind:this={button}
>
    {content}
</button>
