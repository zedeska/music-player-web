<script>
    import TrackElement from "../components/TrackElement.svelte";
    import AlbumElement from "../components/AlbumElement.svelte";
    import { onMount } from "svelte";

    export let params;
    export let downloadTrack;
    export let playAlbum;
    export let addToQueue;
    export let getUsersPlaylists;
    export let addTrackToPlaylist;
    export let downloadAlbum;
    export let addAlbumToQueue;
    export let addAlbumToPlaylist;
    export let fetchArtist;

    let artistData = null;

    onMount(async () => {
      if (params.id) {
        artistData = await fetchArtist(params.id, params.platform);
      }
    });

</script>

{#if artistData}
<div class="flex flex-row gap-3 border-b-2 border-gray-800 pb-2">
        <img src="{artistData.image}" alt="artist-image" class="max-w-[150px] max-h-[150px] self-end" style="border-radius: 50%;" />

        <div class="grid grid-rows-3 p-2">
            <div class="row-start-3 grid grid-cols-3">
                <h2 class="self-end w-max text-7xl font-bold overflow-hidden text-ellipsis whitespace-nowrap">{artistData.name}</h2>
            </div>
        </div>
    </div>
    
    <div>
        <h2 class="text-4xl font-bold">Top Tracks</h2>
        {#if !artistData.top_tracks}
            <p>No top tracks available.</p>
        {:else}
            {#each artistData.top_tracks as track}
                <TrackElement {track} {downloadTrack} {playAlbum} {addToQueue} {getUsersPlaylists} {addTrackToPlaylist} numbered={true} tracksData={artistData.top_tracks} />
            {/each}
        {/if}
    </div>

    <div>
        <h2 class="text-4xl font-bold">Albums</h2>
        <div class="flex flex-wrap">
            {#each artistData.last_release as album}
                <AlbumElement {album} {downloadAlbum} {addAlbumToQueue} {getUsersPlaylists} {addAlbumToPlaylist} {playAlbum} />
            {/each}
        </div>
        
    </div>
{/if}