// app.js
import axios from "axios";

const SERVER = "https://api.yams.tf/";
const VERSION = "v1.0.0";

// ------------------ API FUNCTIONS ------------------ //

export async function Search(query) {
  const res = await axios.get(SERVER + "search", { params: { query } });
  return res.data;
}

export async function UploadTrack(file, token) {
  // Check if file is provided
  if (!file) {
    throw new Error("No file provided");
  }

  // Check file type
  if (file.type !== "audio/flac") {
    throw new Error("Invalid file type. Only FLAC audio files are allowed.");
  }

  // Optional: Check file extension as additional validation
  if (!file.name.toLowerCase().endsWith('.flac')) {
    throw new Error("Invalid file extension. Only .flac files are allowed.");
  }

  // Create FormData for file upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('token', token);

  try {
    const res = await axios.post(SERVER + "upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Optional: Track upload progress
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload Progress: ${percentCompleted}%`);
      }
    });

    if (res.status !== 200) {
      throw new Error("Upload failed");
    }

    return res.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      throw new Error(`Upload failed: ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error("Upload failed: No response from server");
    } else {
      // Something else happened
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
}

// Helper function to validate file before upload (can be used in UI)
export function ValidateFlacFile(file) {
  const errors = [];

  if (!file) {
    errors.push("No file selected");
    return errors;
  }

  // Check MIME type
  if (file.type !== "audio/x-flac" && file.type !== "audio/flac") {
    errors.push("Invalid file type. Only FLAC audio files are allowed.");
  }

  // Check file extension
  if (!file.name.toLowerCase().endsWith('.flac')) {
    errors.push("Invalid file extension. Only .flac files are allowed.");
  }

  // Check file size (optional - adjust limit as needed)
  const maxSize = 200 * 1024 * 1024; // 200MB
  if (file.size > maxSize) {
    errors.push(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
  }

  return errors;
}

export async function DownloadTrack(id, title, artist, token) {
    await ValidateAudioSource(`${SERVER}play?id=${id}&token=${token}`);
    const res = await fetch(`${SERVER}play?id=${id}&token=${token}`);
    if (!res.ok) throw new Error("Download failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${artist} - ${title}.flac`;
    a.click();
    URL.revokeObjectURL(url);
}

export async function DownloadMultipleTracks(tracks, token, maxConcurrent = 3) {
  const results = [];
  const executing = new Set();
  
  for (const track of tracks) {
    const promise = DownloadTrack(track.id, track.title, track.artist, token);
    executing.add(promise);
    
    // Remove from executing set when done
    promise.finally(() => executing.delete(promise));
    results.push(promise);

    if (executing.size >= maxConcurrent) {
      await Promise.race(executing);
    }
  }

  // Wait for all remaining downloads
  return Promise.allSettled(results);
}

export async function Login(username, password) {
  try {
    const res = await axios.post(SERVER + "login", { username, password });
    if (res.status !== 200) throw new Error("login failed");
    return res.data;
  } catch {
    throw new Error("login failed");
  }
}

export async function Register(username, password) {
  try {
    const res = await axios.post(SERVER + "register", { username, password });
    if (res.status !== 200) throw new Error("register failed");
    return res.data;
  } catch {
    throw new Error("register failed");
  }
}

export async function ValidateAudioSource(url) {
  try {
    const res = await axios.head(url);

    switch (res.status) {
      case 200:
        return;
      case 400:
      case 404:
        throw new Error("Could not cache this track, please try again later");
      case 401:
        throw new Error("Unauthorized access. Please try to log in again.");
      case 500:
        throw new Error("Internal server error.");
      default:
        throw new Error("Unexpected status code: " + res.status);
    }
  } catch (err) {
    throw new Error("Error: " + err.message);
  }
}

export async function GetAlbum(id) {
  return _get("album", { id });
}

export async function GetListened(token) {
  return _get("listened", { token });
}

export async function GetArtist(id) {
  return _get("artist", { id });
}

export async function CreatePlaylist(name, token) {
  return _post("create-playlist", { name, token });
}

export async function GetUsersPlaylists(token) {
  return _get("user-playlists", { token });
}

export async function GetPlaylist(id) {
  return _get("playlist", { id });
}

export async function AddTrackToPlaylist(playlistID, trackIDs, token) {
  return _post("add-to-playlist", {
    playlist_id: playlistID,
    track_ids: trackIDs,
    token,
  });
}

export async function DeleteTrackFromPlaylist(playlistID, trackID, token) {
  return _post("delete-track-from-playlist", {
    playlist_id: playlistID,
    track_id: trackID,
    token,
  });
}

export async function DeletePlaylist(playlistID, token) {
  return _post("delete-playlist", {
    playlist_id: playlistID,
    token,
  });
}

// ------------------ HELPERS ------------------ //

async function _get(endpoint, params) {
  const res = await axios.get(SERVER + endpoint, { params });
  if (res.status !== 200) throw new Error("Request failed");
  return res.data;
}

async function _post(endpoint, body) {
  const res = await axios.post(SERVER + endpoint, body);
  if (res.status !== 200) throw new Error("Request failed");
  return res.data;
}
