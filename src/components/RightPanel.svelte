<script>
  import TrackElement from "./TrackElement.svelte";

    export let queue;
    export let init;
    export let currentTrack;
    export let downloadTrack;
    export let getUsersPlaylists;
    export let addTrackToPlaylist;
    export let addToQueue;
</script>

<p class="text-2xl text-center">Queue</p>

{#if queue.length > 0}
        <div>
          {#each queue as track}
            <TrackElement {track} init={init} active={currentTrack && currentTrack.id === track.id} {downloadTrack} {addTrackToPlaylist} {getUsersPlaylists} {addToQueue}  />
          {/each}
        </div>
{/if}
