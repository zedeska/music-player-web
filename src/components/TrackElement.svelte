<script>
    import { push } from "svelte-spa-router";
    import ContextMenu, { Item, Divider } from "svelte-contextmenu";
    import { GetPlatformNumber } from "../App.js";
    let MyMenu;

    let playlists;
    let addingToPlaylist = false;
    let innerWidth;

    export let track;
    export let init = (...args) => {};
    export let downloadTrack = (...args) => {};
    export let addToQueue = (...args) => {};
    export let getUsersPlaylists = (...args) => {};
    export let addTrackToPlaylist = (...args) => {};
    export let tracksData = {};
    export let playAlbum = (...args) => {};
    export let active = false;
    export let queue = false;
    export let deleteFromQueue = (...args) => {};

    export let deleteTrackFromPlaylist = (...args) => {};
    export let playlistID = 0;

    export let album = false;
    export let selectedTracks = [];
</script>

<svelte:window bind:innerWidth />

<div class="group ease-in-out transition flex flex-row align-middle items-center rounded-lg p-2 gap-2 justify-between max-w-full" class:bg-violet-950={active} class:hover:bg-violet-950={!active} on:contextmenu={(e) => {
    if (!queue) MyMenu.show(e);
  }}>
    <div class="flex items-center gap-2 flex-row truncate">
        {#if album}
            <button class="relative cursor-pointer" on:click={() => {playAlbum(tracksData, 0, 0, tracksData.indexOf(track))}}>
                <img class="min-h-[40px] min-w-[40px] max-h-[40px] max-w-[40px] relative rounded-lg" src="{track.cover || ''}" alt="">
                <img src="/play-solid.svg" alt="" class="group-hover:visible invisible absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </button>
        {:else}
            <button class="relative cursor-pointer" on:click={() => {init(track)}}>
                <img class="min-h-[40px] min-w-[40px] max-h-[40px] max-w-[40px] relative rounded-lg" src="{track.cover || ''}" alt="">
                <img src="/play-solid.svg" alt="" class="group-hover:visible invisible absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </button>
        {/if}
        <div class="">
            <h4 class="" >{track.title}</h4>
            <button class="text-sm cursor-pointer hover:underline" on:click={() => {push("/artist/"+GetPlatformNumber(track.platform)+"/"+track.artist_id)}}>{track.artist || 'Unknown'}</button>
        </div> 
    </div>
    {#if queue}
        <button class="cursor-pointer" on:click={() => {deleteFromQueue(track)}}>
            <img src="/xmark.svg" alt="">
        </button>
    {:else}
        <div class="flex gap-2">
            {#if album}
            <label for="track-{track.id}">
            <div class="grid items-center justify-center">
                <input id="track-{track.id}" class="group-hover:block peer col-start-1 row-start-1 h-4 w-4 appearance-none rounded border border-gray-300 ring-transparent checked:border-violet-600 checked:bg-violet-600 dark:border-gray-600 dark:checked:border-violet-600 forced-colors:appearance-auto" class:block={selectedTracks.length>0 || innerWidth < 768} class:hidden={selectedTracks.length===0 && innerWidth >= 768} type="checkbox" checked={selectedTracks.includes(track)} on:change={() => {
                    if (selectedTracks.includes(track)) {
                        selectedTracks = selectedTracks.filter(item => item != track);
                    } else {
                        selectedTracks = [...selectedTracks, track];
                    }
                }} />
                <svg viewBox="0 0 14 14" fill="none" class="invisible col-start-1 row-start-1 stroke-white peer-checked:visible dark:text-violet-300 forced-colors:hidden"><path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                </div>
                </label>
            {/if}
            <p>{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</p>
            <button class="cursor-pointer md:hidden" on:click={MyMenu.createHandler()}><img class="min-w-[18px]" height="18px" width="18px" src="/more-vert.svg" alt=""></button>
        </div>
    {/if}
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
        <button on:click={() => addingToPlaylist = false} class="cursor-pointer" data-autoclose="false" ><img height="16px" width="16px" src="/arrow-left.svg" alt=""></button>
        <Divider />
        <div class="w-30">
            {#each playlists.playlists as playlist}
                <Item on:click={async () => {addingToPlaylist = false; await addTrackToPlaylist(playlist.id, [{id: track.id, platform: GetPlatformNumber(track.platform)}])}} class="cursor-pointer">
                    <span class="flex text-ellipsis">
                        <img src="/playlist.svg" alt=""> {playlist.name}
                    </span>
                </Item>
            {/each}
        </div>
    {/if}

</ContextMenu>