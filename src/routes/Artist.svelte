<script>
    import { GetArtist } from "../App.js";
    import toast from "svelte-french-toast";
    import TrackElement from "../components/TrackElement.svelte";
    import AlbumElement from "../components/AlbumElement.svelte";

    export let params;
    export let downloadTrack;
    export let playAlbum;
    export let addToQueue;
    export let getUsersPlaylists;
    export let addTrackToPlaylist;
    export let downloadAlbum;
    export let addAlbumToQueue;
    export let addAlbumToPlaylist;

    let artistData = null;

    async function fetchArtist(id) {
        if (!id || id === 0) {
            toast.error("Artist ID is not provided.");
            return;
        }
        
        try {
            const result = await GetArtist(id);
            artistData = result;
        } catch (error) {
            toast.error("Error fetching artist data");
            return;
        }
    }

    $: fetchArtist(params.id);

</script>

{#if artistData}
<div class="flex flex-row gap-3 border-b-2 border-gray-800 pb-2">
        <img src="{artistData.image}" alt="artist-image" class="rounded-full max-w-[200px]" />

        <div class="grid grid-rows-3 p-2">
            <div class="row-start-3 grid grid-cols-3">
                <h2 class="self-end text-7xl font-bold text-ellipsis text-nowrap">{artistData.name}</h2>
            </div>
        </div>
    </div>
    
    <div>
        <h2 class="text-4xl font-bold">Top Tracks</h2>
        {#each artistData.top_tracks as track}
            <TrackElement {track} {downloadTrack} {playAlbum} {addToQueue} {getUsersPlaylists} {addTrackToPlaylist} numbered={true} tracksData={artistData.top_tracks} />
        {/each}
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