<script>
  import { toast } from "svelte-french-toast";
  import { Search } from '../App.js';
  import TrackElement from "../components/TrackElement.svelte";
  import AlbumElement from "../components/AlbumElement.svelte";

    export let params;
    export let init;
    export let downloadTrack;
    export let addToQueue;
    export let getUsersPlaylists;
    export let addTrackToPlaylist;
    export let addAlbumToPlaylist;
    export let downloadAlbum;
    export let addAlbumToQueue;
    export let playAlbum;

    let resultJSON;

    async function search(query) {
    if (!query.trim()) {
      toast.error('Search query cannot be empty.');
      return;
    }

    try {
      const data = await Search(query.replace(/ /g, '%20'));
      resultJSON = data;
    } catch (error) {
      toast.error("Search failed.");
    }
  }

  $: if (params?.query) {
    search(params.query);
  }
</script>

{#if resultJSON}
        <h3 class="text-2xl p-2" >Tracks</h3>
        <div class="ml-2">
          {#if resultJSON.tracks === null}
            <p class="ml-2">No tracks found.</p>
          {:else}
            {#each resultJSON.tracks as track}
              <TrackElement {track} {init} {downloadTrack} {addToQueue} {getUsersPlaylists} {addTrackToPlaylist} />
            {/each}
          {/if}
        </div>

        <h3 class="text-2xl p-2">Albums</h3>
        <div class="flex-row flex ml-2 flex-wrap">
          {#if resultJSON.albums === null}
            <p class="ml-2">No albums found.</p>
          {:else}
            {#each resultJSON.albums as album}
              <AlbumElement {album} {downloadAlbum} {addAlbumToQueue} {getUsersPlaylists} {addAlbumToPlaylist} {playAlbum} />
            {/each}
          {/if}
        </div>

    {/if}