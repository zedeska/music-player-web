<script>
  import { DownloadTrack, DownloadMultipleTracks, ValidateAudioSource, GetUsersPlaylists, CreatePlaylist, AddTrackToPlaylist, GetAlbum, DeletePlaylist, DeleteTrackFromPlaylist, GetPlatformNumber, GetArtist } from './App.js';
  import toast, { Toaster } from 'svelte-french-toast';

  import Navbar from './components/Navbar.svelte';
  import Controlbar from './components/Controlbar.svelte';
  import RightPanel from './components/RightPanel.svelte';
  import LeftPanel from './components/LeftPanel.svelte';
  import LoginRegisterForm from './components/LoginRegisterForm.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import PlayerOverlay from './components/PlayerOverlay.svelte';

  import Router from 'svelte-spa-router';
  import {wrap} from 'svelte-spa-router/wrap';

  import Search from './routes/Search.svelte';
  import Album from './routes/Album.svelte';
  import Home from './routes/Home.svelte';
  import Artist from './routes/Artist.svelte';
  import Playlist from './routes/Playlist.svelte';
  import Profile from './routes/Profile.svelte';
  import { onMount } from 'svelte';

  const SERVER = "https://api.yams.tf/";

  let token;
  let isTrackLoading = false;
  let currentAudioTrack = new Audio();
  let currentTrack;
  let volume = 50; // Volume as percentage (0-100)
  let currentTime = 0;
  let duration = 0;
  let isDragging = false;
  let muted = false;
  let paused = true;
  let usersPlaylists = null;
  let loop = 0;
  let sidebar = false;
  let overlay = false;
  let queueOverlay = false;
  let innerWidth = 1920;

  let queue = [];

  const routes = {
    '/': wrap({
      component: Home,
      props: {
        getToken,
        init,
        downloadTrack,
        addToQueue,
        getUsersPlaylists,
        addTrackToPlaylist
      }
    }),
    '/search/:query': wrap({
      component: Search,
      props: { 
        init,
        downloadTrack,
        addToQueue,
        getUsersPlaylists,
        addTrackToPlaylist,
        addAlbumToPlaylist,
        addAlbumToQueue,
        playAlbum,
        downloadAlbum
      }
    }),
    "/album/:platform/:id" : wrap({
      component: Album,
      props: { 
        downloadTrack,
        playAlbum,
        downloadAlbum,
        addToQueue,
        getUsersPlaylists,
        addTrackToPlaylist,
        fetchAlbum
      }
    }),
    "/artist/:platform/:id": wrap({
      component: Artist,
      props: { 
        downloadTrack,
        playAlbum,
        addToQueue,
        getUsersPlaylists,
        addTrackToPlaylist,
        downloadAlbum,
        addAlbumToPlaylist,
        addAlbumToQueue,
        fetchArtist
      }
    }),
    "/playlist/:id": wrap({
      component: Playlist,
      props: { 
        downloadTrack,
        playAlbum,
        downloadAlbum,
        addToQueue,
        getUsersPlaylists,
        addTrackToPlaylist,
        deletePlaylist,
        deleteTrackFromPlaylist
      }
    }),
    "/profile": wrap({
      component: Profile,
      props: { userToken: token }
    })
  };

  function getToken() {
    return token;
  }

  async function fetchArtist(id, p) {
    if (!id || id === 0) {
        toast.error("Artist ID is not provided.");
        return;
    }
    
    try {
        const result = await GetArtist(id, p);
        return result;
    } catch (error) {
        toast.error("Error fetching artist data");
        return;
    }
  }

  function changeLoop() {
    if (loop == 0) {
      loop = 1; // Set to loop one track
    } else if (loop == 1) {
      loop = 2; // Set to loop all tracks
    } else {
      loop = 0; // Disable looping
    }
  }

  function shuffle() {
    let currentIndex = queue.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [queue[currentIndex], queue[randomIndex]] = [
        queue[randomIndex], queue[currentIndex]];
    }

    let currentTrackIndex = getIndexOfCurrentTrack();
    [queue[0], queue[currentTrackIndex]] = [
      queue[currentTrackIndex], queue[0]];
  }

  async function deletePlaylist(playlistID) {
    try {
      await DeletePlaylist(playlistID, token);
      toast.success("Playlist deleted successfully!");
    } catch (error) {
      toast.error("Error deleting playlist");
    }
  }

  async function deleteTrackFromPlaylist(playlistID, trackID) {
    try {
      await DeleteTrackFromPlaylist(playlistID, trackID, token);
      window.location.reload();
      toast.success("Track removed from playlist successfully!");
    } catch (error) {
      toast.error("Error removing track from playlist");
    }
  }

  async function fetchAlbum(id, platform) {
    if (!id || id === 0) {
        toast.error("Album ID is not provided.");
        return;
    }
    try {
        const result = await GetAlbum(id, platform);
        const albumData = result;
        return albumData;
    } catch (error) {
        toast.error("Error fetching album data");
        return;
    }
}

  function playAlbum(tracks, id=0, platform=0, offset=0) {
    if (tracks.length > 0) {
      init(tracks[offset]);
      tracks.forEach((track) => {
        addToQueue(track);
      });
    } else if (id && id != 0 && platform && platform != 0) {
      fetchAlbum(id, platform).then(albumData => {
        if (albumData) {
          init(albumData.tracks[0]);
          albumData.tracks.forEach((track) => {
          addToQueue(track);
      });
        }
      });
    } else {
      toast.error("No tracks available in this album.");
    }
  }

  function addMultipleToQueue(tracks) {
    tracks.forEach((track) => {
      addToQueue(track);
    });
  }

  async function addAlbumToQueue(tracks=[],id=0, platform=0) {
    // Fetch the album details using the provided ID
    if (id && id != 0 && platform && platform != 0) {
      const album = await fetchAlbum(id, platform);
      if (album) {
        addMultipleToQueue(album.tracks);
      }
    } else if (tracks.length > 0) {
      addMultipleToQueue(tracks);
    }
  }

  async function addAlbumToPlaylist(playlistID, tracks=[[]], id=0, platform=0) {
    // Fetch the album details using the provided ID
    if (id && id != 0) {
      const album = await fetchAlbum(id, platform);
      if (album) {
        const ids = [];
        for (const track of album.tracks) {
          ids.push({id: track.id, platform: GetPlatformNumber(track.platform)});
        }
        await addTrackToPlaylist(playlistID ,ids);
      }
    } else if (tracks.length > 0) {
      await addTrackToPlaylist(playlistID, tracks);
    }
  }

  function addToQueue(track) {
    let included = false;
    queue.forEach((value) => {
      if (track === value.track) {
        included = true;
        return;
      }
    });
    if (!included) {
      queue.push({id: queue.length + 1, track: track});
      queue = queue; // Trigger reactivity
    }
  }

  async function init(track) {
    currentAudioTrack.remove();
    const audioUrl = `${SERVER}play?id=${track.id}&token=${token}&p=${GetPlatformNumber(track.platform)}`;
    
    // Show loading state
    isTrackLoading = true;

    try {
       // Validate audio source
      await ValidateAudioSource(audioUrl);
    } catch (error) {
      toast.error(error);
      isTrackLoading = false;
      return;
    }

    currentTrack = track;
    addToQueue(track);
    
    // If valid, set source and play
    currentAudioTrack.src = audioUrl;
    currentAudioTrack.play();
  }

  function playPreviousTrack() {
    if (queue.length > 1) {
      const previousTrack = getIndexOfCurrentTrack() - 1;
      if (previousTrack >= 0) {
        init(queue[previousTrack].track);
      }
    }
  }

  function playNextTrack() {
    if (queue.length >= 1) {
      if (!currentTrack) {
        init(queue[0].track);
      } else {
        const nextTrack = getIndexOfCurrentTrack() + 1;
        if (nextTrack < queue.length) {
          init(queue[nextTrack].track);
        } else if (nextTrack >= queue.length && loop == 1) {
          init(queue[0].track); // Loop back to the first track
        }
      }
    }
  }

  function getIndexOfCurrentTrack() {
    let indexx = 0;
    queue.forEach((value, index) => {
      if (value.track === currentTrack) {
        indexx = index;
      }
    });
    return indexx;
  }

  function playAndPause() {
    if (currentAudioTrack.paused) {
      currentAudioTrack.play();
    } else {
      currentAudioTrack.pause();
    }
  }

  currentAudioTrack.onloadstart = () => {
    // Optional: Handle audio load event if needed
    isTrackLoading = true;
  };

  currentAudioTrack.onplaying = () => {
    if (isTrackLoading) {
      isTrackLoading = false;
    }
    paused = false;
  };
  currentAudioTrack.onpause = () => {
    paused = true;
  };

  currentAudioTrack.ontimeupdate = () => {
    if (!isDragging) {
      currentTime = currentAudioTrack.currentTime;
      
      // Update progress bar fill
      const progressBar = document.getElementsByClassName('progress-bar');
      if (progressBar && duration > 0) {
        const percent = (currentTime / duration) * 100;
        for (let elt of progressBar) {
          elt.style.setProperty('--progress-percent', `${percent}%`);
        }
      }
    }
  };

  currentAudioTrack.onloadedmetadata = () => {
    duration = currentAudioTrack.duration;
  };

  currentAudioTrack.onended = () => {
    currentTime = 0;
    const progressBar = document.getElementsByClassName('progress-bar');
    for (let elt of progressBar) {
        elt.style.setProperty('--progress-percent', `${currentTime}%`);
      }
    if (loop == 2) {
      currentAudioTrack.currentTime = 0;
      currentAudioTrack.play(); // Restart the current track
    } else {
      playNextTrack();
    }
  };

  // Update audio volume when slider changes
  function updateVolume() {
    currentAudioTrack.volume = volume / 100;
    localStorage.setItem('volume', String(volume));
    
    // Update CSS custom property for volume slider fill
    const volumeSlider = document.querySelector('.volume-slider');
    if (volumeSlider) {
      volumeSlider.style.setProperty('--progress-percent', `${volume}%`);
    }
  }

  // Progress bar functions
  function updateCurrentTime() {
    currentAudioTrack.currentTime = currentTime;
    
    // Update CSS custom property for progress bar fill
    const progressBar = document.getElementsByClassName('progress-bar');
    if (progressBar && duration > 0) {
      const percent = (currentTime / duration) * 100;
      for (let elt of progressBar) {
        elt.style.setProperty('--progress-percent', `${percent}%`);
      }
    }
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function muteUnmute() {
    if (currentAudioTrack.volume > 0 && !muted) {
      currentAudioTrack.volume = 0;
      muted = true;
    } else {
      currentAudioTrack.volume = volume / 100;
      muted = false;
    }
  }

  async function logout() {
    setTimeout(() => {
      localStorage.removeItem('token');
      token = null;
      currentTrack = null;
      queue = [];
      currentAudioTrack.pause();
      currentAudioTrack.src = '';
      toast.success('Logged out successfully.');
    }, 500); 
  }

  async function downloadTrack(track) {
    toast.promise(
      DownloadTrack(track, GetPlatformNumber(track.platform), token),
      {
        loading: 'Downloading...',
        success: 'Downloaded successfully!',
        error: (error) => { return error; },
      }
    );
  }

  async function downloadAlbum(tracks, platform, id=0, album="") {
    if (id && id != 0) {
      const album_data = await fetchAlbum(id, platform);
      if (album_data) {
        tracks = album_data.tracks;
      }
      album = album_data.title;
    }
    toast.promise(
      DownloadMultipleTracks(tracks, token, platform, album),
      {
        loading: `Downloading...`,
        success: `Downloaded successfully!`,
        error: (error) => { return error; },
      }
    );
}

  async function getUsersPlaylists(global=false) {
    try {
        const result = await GetUsersPlaylists(token);
        if (global) {
            usersPlaylists = result;
            return;
        }
        return result;
    } catch (error) {
        toast.error("Error fetching playlists");
    }
  }

  async function createPlaylist(name) {
    try {
        const result = await CreatePlaylist(name, token);
        return result;
    } catch (error) {
        toast.error("Error creating playlist");
    }
  }

  async function addTrackToPlaylist(playlistId, tracks) {
    try {
      await AddTrackToPlaylist(playlistId, tracks, token);
    } catch (error) {
      toast.error("Error adding track to playlist");
    }
  }

  $: if (innerWidth <= 768) {
    volume = 100;
    updateVolume();
  }

  // Set initial volume
  onMount(async () => {
    if (localStorage.getItem('volume')) {
      volume = Number(localStorage.getItem('volume'));
    }
    if (localStorage.getItem('token')) {
      token = localStorage.getItem('token');
    }

    // ensure overlays are closed on fresh load (works around cached DOM / SW hydration)
    overlay = false;
    queueOverlay = false;

    // defensive: remove any stray .open classes left in cached HTML
    document.querySelectorAll('.queue-overlay.open, .player-overlay.open').forEach(el => el.classList.remove('open'));
  });
</script>

<svelte:window bind:innerWidth />

<main>
  <Toaster />
  {#if !token}

    <LoginRegisterForm bind:token {updateVolume} />

  {:else}

  <div class="h-screen w-full">
    <div class="h-full w-full flex flex-col absolute overflow-hidden">
    <aside class="queue-overlay absolute h-full w-full z-150 bg-black p-2" class:open={queueOverlay} >
      <button class="text-xl cursor-pointer" on:click={() => {queueOverlay = false;}}><i class="fa-solid fa-xmark"></i></button>
      <RightPanel bind:queue {init} {currentTrack} {downloadTrack} {addToQueue} {addTrackToPlaylist} {getUsersPlaylists} />
    </aside>

    <PlayerOverlay {paused} bind:open={overlay} bind:openQueue={queueOverlay} {loop} {changeLoop} {shuffle} {currentTrack} {currentAudioTrack} {formatTime} bind:currentTime {duration} bind:volume bind:muted bind:isTrackLoading {playPreviousTrack} {playAndPause} {playNextTrack} {updateCurrentTime} {updateVolume} {muteUnmute} />
    <Sidebar {getUsersPlaylists} {createPlaylist} {usersPlaylists} bind:open={sidebar} />
    <Navbar {logout} bind:sidebar />

    <div class="overflow-y-hidden h-full w-full grid-cols-5 grid gap-2">
      
      <div class="hidden md:block col-start-1 h-full border-gray-800 border-2 rounded-lg">
        <LeftPanel {getUsersPlaylists} {createPlaylist} {usersPlaylists} />
      </div>

      <div class="col-start-1 col-span-5 md:col-start-2 md:col-span-3 overflow-y-scroll h-full border-gray-800 border-2 rounded-lg">
        <Router {routes} />
      </div>
      
      <div class="hidden md:block col-start-5 overflow-y-scroll h-full border-gray-800 border-2 rounded-lg">
        <RightPanel bind:queue {init} {currentTrack} {downloadTrack} {addToQueue} {addTrackToPlaylist} {getUsersPlaylists} />
      </div>
    </div>

    {#if currentTrack}
      <Controlbar {paused} {innerWidth} bind:open={overlay} {loop} {changeLoop} {shuffle} {currentTrack} {currentAudioTrack} {formatTime} bind:currentTime {duration} bind:volume bind:muted bind:isTrackLoading {playPreviousTrack} {playAndPause} {playNextTrack} {updateCurrentTime} {updateVolume} {muteUnmute} />
    {/if}
    </div>
  </div>

    
    
  {/if}
</main>

<style>
  /* queue overlay: hidden by default, slides up when .open is added */
  .queue-overlay {
    transition: bottom 0.4s ease-in-out;
    bottom: -100%;
  }
  .queue-overlay.open {
    bottom: 0;
  }
</style>