<script>
  import TrackElement from "./TrackElement.svelte";
  import {flip} from "svelte/animate";
  import {dndzone} from "svelte-dnd-action";

  export let queue;
  export let init;
  export let currentTrack;
  export let downloadTrack;
  export let getUsersPlaylists;
  export let addTrackToPlaylist;
  export let addToQueue;

  $: items = queue;
  const flipDurationMs = 300;
    function handleDndConsider(e) {
        items = e.detail.items;
        queue = items;
    }
    function handleDndFinalize(e) {
        items = e.detail.items;
        queue = items;
    }
</script>

<p class="text-2xl text-center">Queue</p>

{#if queue.length > 0}
        <div use:dndzone="{{items, flipDurationMs}}" on:consider="{handleDndConsider}" on:finalize="{handleDndFinalize}">
          {#each items as item(item.id) }
            <div animate:flip="{{duration: flipDurationMs}}">
              <TrackElement track={item.track} init={init} active={currentTrack && currentTrack.id === item.track.id} {downloadTrack} {addTrackToPlaylist} {getUsersPlaylists} {addToQueue}  />
            </div>
          {/each}
        </div>
{/if}
