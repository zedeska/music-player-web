// app.js
import axios from "axios";

const SERVER = "https://api.yams.tf/";
const VERSION = "v1.0.0";

// ------------------ API FUNCTIONS ------------------ //

export async function Search(query) {
  const res = await axios.get(SERVER + "search", { params: { query } });
  return res.data;
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
