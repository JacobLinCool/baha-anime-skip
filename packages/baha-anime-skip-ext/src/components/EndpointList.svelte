<script lang="ts">
    export let endpoints: string[];
</script>

{#each endpoints as endpoint}
    <div class="tw-flex tw-items-center tw-justify-between tw-gap-4">
        <div class="db-endpoint tw-flex-1 tw-overflow-auto tw-whitespace-pre tw-text-neutral">
            {endpoint}
        </div>
        <div>
            <button
                class="tw-btn tw-btn-error tw-btn-outline tw-text-base"
                on:click={() => {
                    endpoints = endpoints.filter((e) => e !== endpoint);
                }}
            >
                移除
            </button>
        </div>
    </div>
{/each}

<style>
    .db-endpoint::-webkit-scrollbar {
        display: none;
    }
</style>
