<script>
    import { push } from "svelte-spa-router";
  import { onMount } from "svelte";

    export let createPlaylist;
    export let getUsersPlaylists;
    export let usersPlaylists;
    export let open = false;

    let newPlaylistName = "";
    let makingPlaylist = false;

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
    <button class="cursor-pointer text-sm" on:click|stopPropagation={() => makingPlaylist = !makingPlaylist} >
        <img src="/plus.svg" alt=""> New playlist
    </button>
    {#if makingPlaylist}
    <div>
        <input class="max-w-full" type="text" on:click|stopPropagation on:input|stopPropagation bind:value={newPlaylistName} placeholder="Playlist name" />
        <button on:click|stopPropagation={async () => {
            await createPlaylist(newPlaylistName);
            usersPlaylists = await getUsersPlaylists();
            makingPlaylist = false;
        }}>Create Playlist</button>
    </div>
    {/if}
</div>

{#if usersPlaylists && usersPlaylists.playlists}
    {#each usersPlaylists.playlists as playlist}
        <div class="flex flex-row gap-2 items-center">
            <button on:click={() => push(`/playlist/${playlist.id}`)} class="cursor-pointer">
                <img src="/playlist.svg" alt=""> {playlist.name}
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