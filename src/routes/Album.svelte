<script>
  import { push } from "svelte-spa-router";
  import TrackElement from "../components/TrackElement.svelte";
  import { onMount } from "svelte";

    export let params;
    export let downloadTrack;
    export let playAlbum;
    export let downloadAlbum;
    export let addToQueue;
    export let getUsersPlaylists;
    export let addTrackToPlaylist;
    export let fetchAlbum;

    let albumData;

    onMount(async () => {
      if (params.id) {
        albumData = await fetchAlbum(params.id, params.platform);
      }
    });
</script>

{#if albumData}
    <div class="flex flex-row gap-3 border-b-2 border-gray-800 pb-2">
        <img src="{albumData.cover}" alt="album-cover" class="h-[230px] w-[230px] rounded-lg" />

        <div class="grid grid-rows-3 p-2 w-full">
        <p class="row-start-1" >ALBUM</p>
            <h2 class="text-7xl font-bold row-start-2 overflow-hidden text-ellipsis whitespace-nowrap" >{albumData.title}</h2>
            <div class="row-start-3 grid grid-cols-3">
                <p class="self-end cursor-pointer" ><button on:click={() => push(`/artist/${albumData.artist_id}`)}>{albumData.artist}</button> • {new Date(albumData.year * 1000).getFullYear()} • {albumData.track_count} Tracks
                    <button class="cursor-pointer self-end" on:click={() => {downloadAlbum(albumData.tracks)}}>
                    <i class="fa-solid fa-download"></i>
                  </button>
                </p>
                <i on:click={() => {playAlbum(albumData.tracks)}} class="justify-self-end self-end fa-solid fa-circle-play text-5xl mt-3 cursor-pointer text-violet-900 col-start-3"></i>
            </div>
        </div>
    </div>

    <div>
        {#each albumData.tracks as track}
            <TrackElement {track} {downloadTrack} {addToQueue} {getUsersPlaylists} {addTrackToPlaylist} tracksData={albumData.tracks} {playAlbum} numbered={true}></TrackElement>
        {/each}
    </div>
{/if}