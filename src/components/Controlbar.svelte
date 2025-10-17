<script>
    import { onMount } from "svelte";
    import { push } from "svelte-spa-router";
    import { GetPlatformNumber } from "../App.js";

    export let currentTrack;
    export let currentTime;
    export let duration;
    export let volume;
    export let muted;
    export let isTrackLoading;
    export let playPreviousTrack;
    export let playAndPause;
    export let playNextTrack;
    export let updateCurrentTime;
    export let updateVolume;
    export let muteUnmute;
    export let formatTime;
    export let currentAudioTrack;
    export let shuffle;
    export let changeLoop;
    export let loop;
    export let open = false;
    export let paused = true;
    export let innerWidth;

    let playIcon = "";

    $: if (paused) {
      playIcon = 'fa-play';
    } else {
      playIcon = 'fa-pause';
    }

    onMount(() => {
        updateVolume();
    });
 </script>
 
 <div class="music-control w-full bg-black grid grid-cols-6 items-center p-1 min-h-[72px]" on:click={() => {
    if (innerWidth < 768) {
        open = true;
    }
    }}>

    {#if currentTrack}
    <div class="flex flex-row items-center md:col-span-1 col-span-3 col-start-1 gap-2 justify-self-start">
        <img src="{currentTrack.cover}" alt="{currentTrack.title} cover" class="h-16 w-16 rounded-lg" />
        <div class="w-full overflow-hidden flex flex-col">
        <p class="text-sm font-semibold md:text-base truncate">{currentTrack.title}</p>
        <p class="md:text-sm text-xs cursor-pointer hover:underline w-fit" on:click|stopPropagation={() => {push("/artist/"+GetPlatformNumber(currentTrack.platform)+"/"+currentTrack.artist_id)}}>{currentTrack.artist || 'Unknown'}</p>
        </div>
    </div>
    {/if}

    <div class="items-center flex flex-col w-1/2 md:col-span-4 md:col-start-2 col-start-6 md:justify-self-center">
      <div class="flex items-center gap-4 justify-center">
        <button class="hidden md:block" on:click={shuffle} ><i class="fa-solid fa-shuffle"></i></button>
        <button on:click|stopPropagation={playPreviousTrack} ><i class="cursor-pointer fa-solid fa-backward"></i></button>
        <button disabled={isTrackLoading} on:click|stopPropagation={playAndPause} class="text-white hover:text-gray-300 cursor-pointer">
        <i class={`fa-solid ${playIcon}`}></i>
        </button>
        <button on:click|stopPropagation={playNextTrack}><i class="cursor-pointer fa-solid fa-forward"></i></button>
        <button class="hidden md:block" on:click={changeLoop}><img src={loop == 0 ? '/repeat.svg' : loop == 1 ? '/repeat-violet.svg' : '/repeat-once.svg'} alt="a" /></button>
      </div>
      <div class="md:flex hidden flex-row items-center w-full gap-2">
        <span>{formatTime(currentTime)}</span>
        <div class="w-full mb-2">
        <input type="range" min="0" max="{duration}" bind:value={currentTime} on:input={updateCurrentTime} on:mousedown={() => currentAudioTrack.pause()} on:mouseup={() => currentAudioTrack.play()} class="w-full h-1 bg-[#4b5563] rounded-lg cursor-pointer progress-bar" />
        </div>
        <span>{formatTime(duration)}</span>
      </div>
    </div>

    
    <!-- Volume Control -->
    <div class="hidden md:flex items-center gap-2 col-start-6 justify-self-end">
        <i class="fa-solid {muted ? 'fa-volume-xmark' : 'fa-volume-high'} text-white text-sm cursor-pointer" on:click={muteUnmute}></i>
        <input 
        type="range" 
        min="0" 
        max="100" 
        bind:value={volume} 
        on:input={updateVolume}
        class="w-20 h-1 bg-[#4b5563] rounded-lg cursor-pointer volume-slider"
        />
        <span class="text-white text-xs ml-2 w-8">{volume}%</span>
    </div>
</div>

<style>
  /* Custom volume slider styling */
  .volume-slider {
    -webkit-appearance: none;
    appearance: none;
  }

  .volume-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, white 0%, white var(--progress-percent, 0%), #4b5563 var(--progress-percent, 0%), #4b5563 100%);
    border-radius: 8px;
  }

  .volume-slider:hover::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, #5d0ec0 0%, #5d0ec0 var(--progress-percent, 0%), #4b5563 var(--progress-percent, 0%), #4b5563 100%);
    border-radius: 8px;
  }

  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
  }

  .volume-slider:hover::-webkit-slider-thumb {
    height: 12px;
    width: 12px;
    border-radius: 50%;
    background: white;
    margin-top: -4px;
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

  /* Firefox volume slider styling */
  .volume-slider::-moz-range-track {
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, white 0%, white var(--progress-percent, 0%), #4b5563 var(--progress-percent, 0%), #4b5563 100%);
    border-radius: 8px;
    border: none;
  }

  .volume-slider:hover::-moz-range-track {
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, #5d0ec0 0%, #5d0ec0 var(--progress-percent, 0%), #4b5563 var(--progress-percent, 0%), #4b5563 100%);
    border-radius: 8px;
  }

  .volume-slider::-moz-range-thumb {
    height: 4px;
    width: 4px;
    border-radius: 50%;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .volume-slider:hover::-moz-range-thumb {
    height: 12px;
    width: 12px;
    border-radius: 50%;
    background: white;
    border: none;
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