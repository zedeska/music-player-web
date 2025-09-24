<script>
    import { push } from "svelte-spa-router";
    import ContextMenu, { Item, Divider } from "svelte-contextmenu";
    let MyMenu;

    let playlists;
    let addingToPlaylist = false;

    export let track;
    export let init = (...args) => {};
    export let downloadTrack = (...args) => {};
    export let addToQueue = (...args) => {};
    export let getUsersPlaylists = (...args) => {};
    export let addTrackToPlaylist = (...args) => {};
    export let tracksData = {};
    export let playAlbum = (...args) => {};
    export let active = false;

    export let deleteTrackFromPlaylist = (...args) => {};
    export let playlistID = 0;

    export let numbered = false;
</script>

<div class="group ease-in-out transition flex flex-row align-middle items-center rounded-lg p-2 gap-2 justify-between" class:bg-violet-950={active} class:hover:bg-violet-950={!active} on:contextmenu={(e) => {
    MyMenu.show(e);
  }}>
    <div class="flex items-center gap-2 flex-row">
        {#if numbered}
            <button class="relative cursor-pointer" on:click={() => {playAlbum(tracksData, 0, tracksData.indexOf(track))}}>
                <img class="min-h-[40px] min-w-[40px] max-h-[40px] max-w-[40px] relative rounded-lg" src="{track.cover || ''}" alt="">
                <i class="fa-solid fa-play group-hover:visible invisible absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
            </button>
        {:else}
            <button class="relative cursor-pointer" on:click={() => {init(track)}}>
                <img class="min-h-[40px] min-w-[40px] max-h-[40px] max-w-[40px] relative rounded-lg" src="{track.cover || ''}" alt="">
                <i class="fa-solid fa-play group-hover:visible invisible absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
            </button>
        {/if}
        <div>
            <h4 class="text-ellipsis whitespace-nowrap" >{track.title}</h4>
            <button class="text-sm cursor-pointer" on:click={() => {push("/artist/"+track.artist_id)}}>{track.artist || 'Unknown'}</button>
        </div> 
    </div>
    <div class="flex gap-2">
        <p>{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</p>
    </div>
</div>

<ContextMenu bind:this={MyMenu}>
    {#if !addingToPlaylist}
        <Item on:click={() => {init(track)}}>Play</Item>
        <Item on:click={() => {downloadTrack(track)}}>Download</Item>
        <Item on:click={() => {addToQueue(track)}}>Add to Queue</Item>
        <Item autoclose={false} on:click={async () => {
            playlists = await getUsersPlaylists();
            addingToPlaylist = true;
        }}>Add To Playlist</Item>
        {#if playlistID != 0}
            <Item on:click={async () => {await deleteTrackFromPlaylist(playlistID,track.id)}}>Remove From Playlist</Item>
        {/if}
    {:else}
        <Item autoclose={false} on:click={() => addingToPlaylist = false} ><i class="fa-solid fa-arrow-left"></i></Item>
        <Divider />
        <div class="overflow-y-scroll">
            {#each playlists.playlists as playlist}
                <Item on:click={async () => {addingToPlaylist = false; await addTrackToPlaylist(playlist.id, [track.id])}} class="cursor-pointer">
                    <i class="fa-solid fa-list"></i> {playlist.name}
                </Item>
            {/each}
        </div>
    {/if}

</ContextMenu>