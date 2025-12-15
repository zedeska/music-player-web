<script>
    import { push } from "svelte-spa-router";
  import { onMount } from "svelte";

    export let createPlaylist;
    export let getUsersPlaylists;
    export let usersPlaylists;
    export let open = false;

    let newPlaylistName = "";
    let makingPlaylist = false;
    let importFromDeezer = false;
    let importedDeezerId = "";

    getUsersPlaylists(true);

    $: usersPlaylists;

    onMount(async () => {
        await getUsersPlaylists(true);
    });

</script>

<aside class="absolute md:hidden h-full w-full bg-black/50 z-50" class:open on:click={() => {
        open = false;
}}>
<div class="h-full px-3 bg-black border-2 border-gray-800 w-2/5 bar" class:open>
<p class="text-2xl text-center" >Library</p>

<div>
    <button class="flex cursor-pointer" on:click|stopPropagation={() => makingPlaylist = !makingPlaylist} >
        <img src="/plus.svg" alt=""> New playlist
    </button>
    {#if makingPlaylist}
    <div class="mb-3">
        <input data-autoclose="false" type="text" on:click|stopPropagation on:input|stopPropagation bind:value={newPlaylistName} placeholder="Playlist name" /> <br>
        <input class="cursor-pointer" name="importFromDeezer" type="checkbox" on:click|stopPropagation bind:checked={importFromDeezer} /> <label for="importFromDeezer" on:click|stopPropagation> import from deezer?</label> <br>
        {#if importFromDeezer}
            <label for="importedDeezerId">ID : </label><input name="importedDeezerId" on:click|stopPropagation on:input|stopPropagation bind:value={importedDeezerId} placeholder="14689133481" type="text">
        {/if}
        <button class="cursor-pointer" on:click={async () => {
            await createPlaylist(newPlaylistName, importFromDeezer ? "deezer" : "", importFromDeezer ? importedDeezerId : "");
            usersPlaylists = await getUsersPlaylists();
            makingPlaylist = false;
        }}>Create Playlist</button>
    </div>
    {/if}
</div>

{#if usersPlaylists && usersPlaylists.playlists}
    {#each usersPlaylists.playlists as playlist}
        <div class="flex flex-row gap-2 items-center">
            <button on:click={() => push(`/playlist/${playlist.id}`)} class="cursor-pointer flex">
                <img class="text-sm" src="/playlist.svg" alt=""> {playlist.name}
            </button>
        </div>
    {/each}
{/if}
</div>
</aside>

<style>
	aside {
		opacity: 0;
		transition: opacity 0.2s ease-in-out;
        left: -100%;
	}

    .bar {
        transition: left 0.4s ease-in-out;
        left: -100%;
    }
	
	.open {
		left: 0;
		opacity: 1;
	}
</style>