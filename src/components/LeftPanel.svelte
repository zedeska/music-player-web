<script>
    import { push } from "svelte-spa-router";
    import ContextMenu, { Item, Divider, Settings } from "svelte-contextmenu";
  import { onMount } from "svelte";
    let myMenu;

    export let createPlaylist;
    export let getUsersPlaylists;
    export let usersPlaylists;

    let newPlaylistName = "";

    getUsersPlaylists(true);

    $: usersPlaylists;

    onMount(async () => {
        await getUsersPlaylists(true);
    });

</script>

<p class="text-2xl text-center" >Library</p>

<div>
    <button on:click={myMenu.createHandler()}>
        <i class="fa-solid fa-plus"></i> New playlist
    </button>
</div>

{#if usersPlaylists && usersPlaylists.playlists}
    {#each usersPlaylists.playlists as playlist}
        <div class="flex flex-row gap-2 items-center">
            <button on:click={() => push(`/playlist/${playlist.id}`)} class="cursor-pointer">
                <i class="fa-solid fa-list"></i> {playlist.name}
            </button>
        </div>
    {/each}
{/if}



<ContextMenu bind:this={myMenu}>
  <input data-autoclose="false" type="text" bind:value={newPlaylistName} placeholder="Playlist name" />
  <Divider />
  <Item on:click={async () => {
    await createPlaylist(newPlaylistName);
    usersPlaylists = await getUsersPlaylists();
  }}>Create Playlist</Item>
</ContextMenu>