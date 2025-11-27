<script>
    import { DisableQobuzSearch, DisableDeezerSearch } from '../App.js';
    import toast from 'svelte-french-toast';
    export let getToken;
</script>

<div class="text-center">
    <h1 class="text-3xl">Control Panel</h1>

    <h2 class="text-xl">Qobuz Search :</h2>
    <button class="border-2 rounded-lg border-violet-900 p-1 cursor-pointer" on:click={() => {
        DisableQobuzSearch(getToken(), false)
            .then(() => toast.success("Qobuz Search Disabled"))
            .catch(() => toast.error("Failed to disable Qobuz Search"));
    }}>Disable</button>
    <button class="border-2 rounded-lg border-violet-900 p-1 cursor-pointer" on:click={() => {
        DisableQobuzSearch(getToken(), true)
            .then(() => toast.success("Qobuz Search Enabled"))
            .catch(() => toast.error("Failed to enable Qobuz Search"));
    }}>Enable</button>

    <h2 class="text-xl">Deezer Search</h2>
    <button class="border-2 rounded-lg border-violet-900 p-1 cursor-pointer" on:click={() => {
        DisableDeezerSearch(getToken(), false)
            .then(() => toast.success("Deezer Search Disabled"))
            .catch(() => toast.error("Failed to disable Deezer Search"));
    }}>Disable</button>
    <button class="border-2 rounded-lg border-violet-900 p-1 cursor-pointer" on:click={() => {
        DisableDeezerSearch(getToken(), true)
            .then(() => toast.success("Deezer Search Enabled"))
            .catch(() => toast.error("Failed to enable Deezer Search"));
    }}>Enable</button>
</div>