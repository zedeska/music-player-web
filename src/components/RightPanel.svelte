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
  export let deleteFromQueue;

  // local copy used by dnd; keep a small dragging flag so we don't clobber local order while dragging
  // always copy the parent's array when not dragging — parent may mutate (push) the same array reference
  let items = queue ? [...queue] : [];
  let isDragging = false;
  $: if (!isDragging) items = queue ? [...queue] : [];

  const flipDurationMs = 300;
  const delayTouchStart = 500;
    function handleDndConsider(e) {
        // update local order for visual feedback only
        isDragging = true;
        items = e.detail.items;
    }
    function handleDndFinalize(e) {
        // commit new order back to parent queue
        items = e.detail.items;
        queue = items;
        isDragging = false;
    }
</script>

<p class="text-2xl text-center mb-2">Queue</p>

{#if queue.length > 0}
        <div use:dndzone={{ items, flipDurationMs, delayTouchStart }} on:consider={handleDndConsider} on:finalize={handleDndFinalize}>
          {#each items as item(item.id) }
            <div animate:flip={{ duration: flipDurationMs }}>
              <TrackElement track={item.track} init={init} active={currentTrack && currentTrack.id === item.track.id} {downloadTrack} {addTrackToPlaylist} {getUsersPlaylists} {addToQueue} {deleteFromQueue} queue={true} />
            </div>
          {/each}
        </div>
{/if}
