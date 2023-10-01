<script lang="ts">
    export let endpoints: string[];
    let value = "";
    let error = "";

    function add_endpoint() {
        if (!value.endsWith("/")) {
            value += "/";
        }

        try {
            if (endpoints.includes(value)) {
                throw new Error("端點已存在");
            }
            try {
                new URL(value);
            } catch {
                throw new Error(`"${value}" 不是有效的 URL`);
            }

            endpoints = [...endpoints, value];
            value = "";
            error = "";
        } catch (e) {
            if (e instanceof Error) {
                error = e.message;
            }
        }
    }
</script>

<div>
    <div class="tw-flex tw-items-center tw-justify-between tw-gap-4">
        <input
            type="text"
            class="tw-input tw-input-bordered tw-input-primary tw-flex-1 tw-text-base tw-text-neutral tw-transition-all tw-duration-100"
            placeholder="https://jacoblincool.github.io/baha-anime-skip/"
            bind:value
            on:keydown={(e) => e.key === "Enter" && add_endpoint()}
        />
        <div>
            <button class="tw-btn tw-btn-primary tw-text-base" on:click={add_endpoint}>
                新增
            </button>
        </div>
    </div>
    {#if error}
        <div class="tw-my-2 tw-text-lg tw-text-error">{error}</div>
    {/if}
</div>
