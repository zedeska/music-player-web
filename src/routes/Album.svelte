<script>
  import { push } from "svelte-spa-router";
  import TrackElement from "../components/TrackElement.svelte";
  import { onMount } from "svelte";
  import { GetPlatformNumber } from "../App.js";

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
    <div class="flex items-center md:flex-row flex-col md:gap-3 gap-1 border-b-2 border-gray-800 pb-2">
        <img src="{albumData.cover}" alt="album-cover" class="md:h-[230px] md:w-[230px] h-[170px] w-[170px] rounded-lg" />

        <div class="md:grid md:grid-rows-3 p-2 w-full">
          <p class="md:row-start-1 hidden md:block" >ALBUM</p>
            <h2 class="md:text-7xl text-5xl font-bold row-start-2 overflow-hidden text-ellipsis whitespace-nowrap" >{albumData.title}</h2>
            <div class="md:row-start-3 grid grid-cols-3 md:text-base text-sm align-items-center">
                <p class="self-end cursor-pointer col-span-2 md:col-span-1" ><button class="hover:underline cursor-pointer" on:click={() => push(`/artist/${GetPlatformNumber(albumData.platform)}/${albumData.artist_id}`)}>{albumData.artist}</button> • {albumData.year} • {albumData.track_count} Tracks
                    <button class="cursor-pointer self-end" on:click={() => {downloadAlbum(albumData.tracks, GetPlatformNumber(albumData.platform))}}>
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