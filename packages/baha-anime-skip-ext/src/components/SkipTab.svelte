<script lang="ts">
    import { onMount } from "svelte";
    import { create_report_url } from "../content/utils";
    import { log } from "../log";
    import { storage } from "../storage";
    import AddEndpoint from "./AddEndpoint.svelte";
    import EndpointList from "./EndpointList.svelte";

    let mounted = false;
    let report_url = "https://github.com/JacobLinCool/baha-anime-skip/issues/new";
    let endpoints: string[] = [];
    $: {
        if (mounted) {
            log("endpoints", endpoints);
            storage.set({ endpoints });
        }
    }

    onMount(async () => {
        const s = await storage.get();
        endpoints = s.endpoints;

        update_report_url();

        mounted = true;
    });

    function update_report_url() {
        report_url = create_report_url();
    }
</script>

<div class="tw-card" data-theme="bahamut">
    <div class="tw-card-body tw-gap-4 tw-text-2xl">
        <h1 class="tw-text-4xl tw-text-primary">
            <a href="https://github.com/JacobLinCool/baha-anime-skip/" target="_blank">
                Bahamut Anime Skip
            </a>
        </h1>
        <div class="tw-flex tw-items-center tw-justify-between tw-gap-4">
            <div class="tw-text-neutral">通報資料錯誤或遺失</div>
            <div>
                <a href={report_url} target="_blank" class="tw-btn tw-btn-primary">GitHub Issues</a>
            </div>
        </div>
        <div class="tw-flex tw-flex-col tw-gap-2">
            <div>
                <span
                    class="tw-tooltip tw-tooltip-right tw-tooltip-secondary tw-text-neutral"
                    data-tip="可以指定多個資料庫端點防止單一端點失效">資料庫端點</span
                >
            </div>
            <div class="tw-flex tw-flex-col tw-gap-2">
                <EndpointList bind:endpoints />
                <AddEndpoint bind:endpoints />
            </div>
        </div>
    </div>
</div>
