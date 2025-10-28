<script>
    import { push } from "svelte-spa-router";
  import { onMount } from "svelte";

    export let createPlaylist;
    export let getUsersPlaylists;
    export let usersPlaylists;

    let newPlaylistName = "";
    let makingPlaylist = false;

    getUsersPlaylists(true);

    $: usersPlaylists;

    onMount(async () => {
        await getUsersPlaylists(true);
    });

</script>

<p class="text-2xl text-center" >Library</p>

<div>
    <button on:click={() => makingPlaylist = !makingPlaylist} >
        <img src="/plus.svg" alt=""> New playlist
    </button>
    {#if makingPlaylist}
    <div>
        <input data-autoclose="false" type="text" bind:value={newPlaylistName} placeholder="Playlist name" />
        <button on:click={async () => {
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