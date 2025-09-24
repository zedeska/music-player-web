<script>
  import { onMount } from "svelte";
  import { GetListened } from "../App.js";
  import toast from "svelte-french-toast";
  import TrackElement from "../components/TrackElement.svelte";

  export let getToken;
  export let init;
  export let downloadTrack;
  export let addToQueue;
  export let getUsersPlaylists;
  export let addTrackToPlaylist;

    let listenedData = null;

    async function fetchListened(token) {
        if (token === "") {
            toast.error("User token is not provided.");
            return;
        }

        try {
            const result = await GetListened(token);
            listenedData = result;
        } catch (error) {
            toast.error("Error fetching listened data");
            return;
        }
    }

    onMount(() => {
        fetchListened(getToken());
    });

</script>

<p class="text-2xl text-center" >Recently listened</p>
{#if listenedData && listenedData.data}
        <div>
          {#each listenedData.data as track}
            <TrackElement {track} {init} {downloadTrack} {addToQueue} {getUsersPlaylists} {addTrackToPlaylist} />
          {/each}
        </div>
{/if}