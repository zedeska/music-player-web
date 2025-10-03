<script>
  import { DownloadTrack, DownloadMultipleTracks, ValidateAudioSource, GetUsersPlaylists, CreatePlaylist, AddTrackToPlaylist, GetAlbum, DeletePlaylist, DeleteTrackFromPlaylist, GetPlatformNumber } from './App.js';
  import toast, { Toaster } from 'svelte-french-toast';

  import Navbar from './components/Navbar.svelte';
  import Controlbar from './components/Controlbar.svelte';
  import RightPanel from './components/RightPanel.svelte';
  import LeftPanel from './components/LeftPanel.svelte';
  import LoginRegisterForm from './components/LoginRegisterForm.svelte';

  import Router from 'svelte-spa-router';
  import {wrap} from 'svelte-spa-router/wrap';

  import Search from './routes/Search.svelte';
  import Album from './routes/Album.svelte';
  import Home from './routes/Home.svelte';
  import Artist from './routes/Artist.svelte';
  import Playlist from './routes/Playlist.svelte';
  import Profile from './routes/Profile.svelte';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';

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
  let usersPlaylists = null;
  let loop = 0;

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
    "/album/:id" : wrap({
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
    "/artist/:id": wrap({
      component: Artist,
      props: { 
        downloadTrack,
        playAlbum,
        addToQueue,
        getUsersPlaylists,
        addTrackToPlaylist,
        downloadAlbum,
        addAlbumToPlaylist,
        addAlbumToQueue
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

  async function fetchAlbum(id) {
    if (!id || id === 0) {
        toast.error("Album ID is not provided.");
        return;
    }
    try {
        const result = await GetAlbum(id);
        const albumData = result;
        return albumData;
    } catch (error) {
        toast.error("Error fetching album data");
        return;
    }
}

  function playAlbum(tracks, id=0, offset=0) {
    if (tracks.length > 0) {
      init(tracks[offset]);
      tracks.forEach((track) => {
        addToQueue(track);
      });
    } else if (id && id != 0) {
      fetchAlbum(id).then(albumData => {
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

  async function addAlbumToQueue(tracks=[],id=0) {
    // Fetch the album details using the provided ID
    if (id && id != 0) {
      const album = await fetchAlbum(id);
      if (album) {
        addMultipleToQueue(album.tracks);
      }
    } else if (tracks.length > 0) {
      addMultipleToQueue(tracks);
    }
  }

  async function addAlbumToPlaylist(playlistID, tracks=[[]], id=0) {
    // Fetch the album details using the provided ID
    if (id && id != 0) {
      const album = await fetchAlbum(id);
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
    currentAudioTrack.pause();
    const audioUrl = `${SERVER}play?id=${track.id}&token=${token}&p=${GetPlatformNumber(track.platform)}`;
    
    // Show loading state
    isTrackLoading = true;
    document.getElementById('btnPlay').className = "fa-solid fa-spinner fa-spin-pulse";
    
    try {
       // Validate audio source
      await ValidateAudioSource(audioUrl);
    } catch (error) {
      toast.error(error);
      document.getElementById('btnPlay').className = "fa-solid fa-play";
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

  currentAudioTrack.onpause = () => {
    document.getElementById('btnPlay').className = "fa-solid fa-play";
  };

  currentAudioTrack.onloadstart = () => {
    // Optional: Handle audio load event if needed
    isTrackLoading = true;
    document.getElementById('btnPlay').className = "fa-solid fa-spinner fa-spin-pulse";
  };

  currentAudioTrack.onplaying = () => {
    if (isTrackLoading) {
      isTrackLoading = false;
    }
    document.getElementById('btnPlay').className = "fa-solid fa-pause";
  };

  currentAudioTrack.ontimeupdate = () => {
    if (!isDragging) {
      currentTime = currentAudioTrack.currentTime;
      
      // Update progress bar fill
      const progressBar = document.querySelector('.progress-bar');
      if (progressBar && duration > 0) {
        const percent = (currentTime / duration) * 100;
        progressBar.style.setProperty('--progress-percent', `${percent}%`);
      }
    }
  };

  currentAudioTrack.onloadedmetadata = () => {
    duration = currentAudioTrack.duration;
  };

  currentAudioTrack.onended = () => {
    document.getElementById('btnPlay').className = "fa-solid fa-play";
    currentTime = 0;
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.setProperty('--progress-percent', `${currentTime}%`);
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
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar && duration > 0) {
      const percent = (currentTime / duration) * 100;
      progressBar.style.setProperty('--progress-percent', `${percent}%`);
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
      DownloadTrack(track.id, track.title, track.artist, track.platform, token),
      {
        loading: 'Downloading...',
        success: 'Downloaded successfully!',
        error: (error) => { return error; },
      }
    );
  }

  async function downloadAlbum(tracks, id=0) {
    if (id && id != 0) {
      const album = await fetchAlbum(id);
      if (album) {
        tracks = album.tracks;
      }
    }
    toast.promise(
      DownloadMultipleTracks(tracks, token),
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
      toast.success("Track added to playlist successfully!");
    } catch (error) {
      toast.error("Error adding track to playlist");
    }
  }

  // Set initial volume
  onMount(async () => {
    if (localStorage.getItem('volume')) {
      volume = Number(localStorage.getItem('volume'));
    }
    if (localStorage.getItem('token')) {
      token = localStorage.getItem('token');
    }
  });
</script>

<main>
  <Toaster />
  {#if !token}

    <LoginRegisterForm bind:token {updateVolume} />

  {:else}

  <div>
    <Navbar {logout}/>

    <div class="overflow-y-hidden p-2 grid-cols-5 grid gap-2">
      
      <div class="col-start-1 h-[calc(100vh-130px)] border-gray-800 border-2 rounded-lg">
        <LeftPanel {getUsersPlaylists} {createPlaylist} {usersPlaylists} />
      </div>
      
      <div class="col-start-2 col-span-3 overflow-y-scroll h-[calc(100vh-130px)] border-gray-800 border-2 rounded-lg">
        <Router {routes} />
      </div>
      
      <div class="col-start-5 overflow-y-scroll h-[calc(100vh-130px)] border-gray-800 border-2 rounded-lg">
        <RightPanel bind:queue {init} {currentTrack} {downloadTrack} {addToQueue} {addTrackToPlaylist} {getUsersPlaylists} />
      </div>
    </div>

    <Controlbar {loop} {changeLoop} {shuffle} {currentTrack} {currentAudioTrack} {formatTime} bind:currentTime {duration} bind:volume bind:muted bind:isTrackLoading {playPreviousTrack} {playAndPause} {playNextTrack} {updateCurrentTime} {updateVolume} {muteUnmute} />

  </div>

    
    
  {/if}
</main>

