<script>
    import { push } from "svelte-spa-router";
    import ContextMenu, { Item, Divider } from "svelte-contextmenu";
    import { GetPlatformNumber } from "../App.js";
    let MyMenu;

    let playlists;
    let addingToPlaylist = false;

    export let album;
    export let downloadAlbum = (...args) => {};
    export let addAlbumToQueue = (...args) => {};
    export let getUsersPlaylists = (...args) => {};
    export let playAlbum = (...args) => {};
    export let addAlbumToPlaylist = (...args) => {};

</script>

<div class="group ease-in-out transition flex flex-col align-middle items-center rounded-lg p-2 hover:bg-violet-950 gap-2" on:contextmenu={(e) => {
    MyMenu.show(e);
  }}>
    <button class="relative cursor-pointer" on:click={() => {push("/album/"+GetPlatformNumber(album.platform)+"/"+album.id)}}>
        <img class="max-h-[100px] max-w-[100px] relative rounded-lg" src="{album.cover || ''}" alt="">
        <i class="fa-solid fa-play group-hover:visible invisible absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
    </button>
    <div>
        <h4>{album.title}</h4>
        <button class="text-sm cursor-pointer hover:underline" on:click={() => {push("/artist/"+GetPlatformNumber(album.platform)+"/"+album.artist_id)}}>{album.artist || 'Unknown'}</button>
    </div>
</div>

<ContextMenu bind:this={MyMenu}>
    {#if !addingToPlaylist}
        <Item on:click={() => {playAlbum([], GetPlatformNumber(album.platform), album.id)}}>Play</Item>
        <Item on:click={() => {downloadAlbum([], GetPlatformNumber(album.platform), album.id)}}>Download</Item>
        <Item on:click={() => {addAlbumToQueue([], GetPlatformNumber(album.platform), album.id)}}>Add to Queue</Item>
        <Item autoclose={false} on:click={async () => {
            playlists = await getUsersPlaylists();
            addingToPlaylist = true;
        }}>Add To Playlist</Item>
    {:else}
        <button on:click={() => addingToPlaylist = false} class="cursor-pointer" data-autoclose="false" ><img height="16px" width="16px" src="/arrow-left.svg" alt=""></button>
        <Divider />
        <div class="w-30">
            {#each playlists.playlists as playlist}
                <Item on:click={async () => {
                    addingToPlaylist = false;
                    await addAlbumToPlaylist(playlist.id, [], album.id, GetPlatformNumber(album.platform));
                    }}>
                    <span class="flex text-ellipsis">
                        <img src="/playlist.svg" alt=""> {playlist.name}
                    </span>
                </Item>
            {/each}
        </div>
    {/if}

</ContextMenu>