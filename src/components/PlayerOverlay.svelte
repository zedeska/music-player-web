<script>
    import { onMount } from "svelte";
    import { push } from "svelte-spa-router";
    import { GetPlatformNumber } from "../App.js";


    export let currentTrack;
    export let currentTime;
    export let duration;
    export let isTrackLoading;
    export let playPreviousTrack;
    export let playAndPause;
    export let playNextTrack;
    export let updateCurrentTime;
    export let updateVolume;
    export let formatTime;
    export let currentAudioTrack;
    export let shuffle;
    export let changeLoop;
    export let loop;
    export let open = false;
    export let openQueue = false;
    export let paused = false;

    onMount(() => {
        updateVolume();
    });
 </script>
 
 <aside class="music-control player-overlay absolute md:hidden h-full w-full bg-black z-100" class:open={open}>
    <div class="w-full h-full flex flex-col items-center p-5 gap-2">
      <div class="justify-start w-full">
        <button class="cursor-pointer justify-start text-lg mb-3 ml-2" on:click={() => {open = !open}}><img src="/arrow-down-tag.svg" alt=""></button>
      </div>
    {#if currentTrack}
    <div class="flex flex-col w-full gap-3">
        <img src="{currentTrack.cover}" alt="{currentTrack.title} cover" class="w-full rounded-lg" />
        <div class="flex flex-col self-start gap-1">
            <p class="text-2xl font-bold">{currentTrack.title}</p>
            <p class="text-sm cursor-pointer hover:underline" on:click={() => {
              open = !open;
              push("/artist/" + GetPlatformNumber(currentTrack.platform) + "/" + currentTrack.artist_id);
              }}>{currentTrack.artist || 'Unknown'}</p>
        </div>
    </div>
    
    {/if}

    <div class="flex h-full w-full flex-col justify-between">

      <div class="flex flex-col items-center w-full">
        <div class="w-full">
        <input type="range" min="0" max="{duration}" bind:value={currentTime} on:input={updateCurrentTime} on:mousedown={() => currentAudioTrack.pause()} on:mouseup={() => currentAudioTrack.play()} class="w-full h-1 bg-[#4b5563] rounded-lg cursor-pointer progress-bar" />
        </div>
        <div class="flex flex-row justify-between w-full px-2 text-xs">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
        </div>
    </div>

    <div class="flex items-center gap-10 justify-center">
        <button on:click={shuffle} ><img src="/shuffle.svg" alt=""></button>
        <button on:click={playPreviousTrack} ><img class="cursor-pointer" src="/backward-solid.svg" alt=""></button>
        <button disabled={isTrackLoading} on:click={playAndPause} class="text-white hover:text-gray-300 cursor-pointer">
        <img class="min-w-[64px]" src={`/${paused ? 'play-solid' : 'pause-solid'}.svg`} alt="">
        </button>
        <button on:click={playNextTrack}><img src="/forward-solid.svg" alt=""></button>
        <button on:click={changeLoop}><img src={loop == 0 ? '/repeat.svg' : loop == 1 ? '/repeat-violet.svg' : '/repeat-once.svg'} alt="a" /></button>
    </div>

    <div class="flex flex-row items-center gap-3 justify-center fixed bottom-0 left-0 relative w-full">
        <button class="cursor-pointer text-xl" on:click={() => {openQueue = !openQueue}}>Queue</button>
    </div>

    </div>


    </div>   
</aside>

<style>
  /* player overlay: keep its own open/closed rules so other .open classes don't interfere */
  .player-overlay {
    transition: bottom 0.4s ease-in-out;
    bottom: -100%;
  }
  .player-overlay.open {
    bottom: 0;
  }

    /* Progress bar styling */
  .progress-bar {
    -webkit-appearance: none;
    appearance: none;
  }

  .progress-bar::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, white 0%, white var(--progress-percent, 0%), #4b5563 var(--progress-percent, 0%), #4b5563 100%);
    border-radius: 8px;
  }

  .progress-bar:hover::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, #5d0ec0 0%, #5d0ec0 var(--progress-percent, 0%), #4b5563 var(--progress-percent, 0%), #4b5563 100%);
    border-radius: 8px;
  }

  .progress-bar::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
  }

  .progress-bar:hover::-webkit-slider-thumb {
    height: 12px;
    width: 12px;
    border-radius: 50%;
    background: white;
    margin-top: -4px;
  }

  /* Firefox progress bar styling */
  .progress-bar::-moz-range-track {
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, white 0%, white var(--progress-percent, 0%), #4b5563 var(--progress-percent, 0%), #4b5563 100%);
    border-radius: 8px;
    border: none;
  }

  .progress-bar:hover::-moz-range-track {
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, #5d0ec0 0%, #5d0ec0 var(--progress-percent, 0%), #4b5563 var(--progress-percent, 0%), #4b5563 100%);
    border-radius: 8px;
  }

  .progress-bar::-moz-range-thumb {
    height: 4px;
    width: 4px;
    border-radius: 50%;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .progress-bar:hover::-moz-range-thumb {
    height: 12px;
    width: 12px;
    border-radius: 50%;
    background: white;
    border: none;
  }

</style>