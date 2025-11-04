// app.js
import axios from "axios";
import { metaflac, preloadWorkerAndWASM } from 'metaflac.wasm/worker';
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { ID3Writer } from "browser-id3-writer";

const SERVER = "https://api.yams.tf/";
const VERSION = "v1.0.0";

preloadWorkerAndWASM();

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

  export function GetPlatformNumber(platform) {
    switch (platform) {
      case '':
        return 0;
      case 'qobuz':
        return 1;
      case 'deezer':
        return 2;
      default:
        return -1; // Unknown platform
    }
  }

  /*
async function GetTrack(track, platform, quality, token) {
  try {
    const res = await fetch(`${SERVER}play?id=${track.id}&token=${token}&p=${platform}&q=${quality}`);
    if (!res.ok) throw new Error("Download failed");
    return await res.blob();
  } catch (error) {
    throw new Error("Error fetching track: " + error.message);
  }
}
  */

async function GetTrack(track, platform, quality, token) {
  const url = `${SERVER}play?id=${track.id}&token=${token}&p=${platform}&q=${quality}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Download failed");

  if (res.body && res.body.getReader) {
    const reader = res.body.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      // yield to event loop occasionally (non-blocking)
      await Promise.resolve();
    }
    // concatenate Uint8Array chunks into a single Blob
    const blob = new Blob(chunks, { type: res.headers.get('content-type') || 'application/octet-stream' });
    return blob;
  } else {
    // fallback: older browsers / no stream support
    const b = await res.blob();
    return b;
  }
}

async function GetAndTagTrack(track, platform, quality, token) {
  try {
    const file = await GetTrack(track, platform, quality, token);
    const title = track.title.replace("/", "-") || 'Unknown Title';
    const artist = track.artist.replace("/", "-") || 'Unknown Artist';
    switch (quality) {
      case 2:
        const taggedFile = await TagFlacFile(file, track);
        return {blob: taggedFile, fileName: `${artist} - ${title}.flac`};
      case 1:
        const taggedMp3 = await TagMp3File(file, track);
        return {blob: taggedMp3, fileName: `${artist} - ${title}.mp3` };
    }
  } catch (err) {
    console.error("Error fetching and tagging track:", err);
    throw new Error("Download failed: " + err.message);
  }
}

export async function DownloadTrack(track, platform, quality, token) {
  try {
    const fileInfo = await GetAndTagTrack(track, platform, quality, token);
    saveAs(fileInfo.blob, fileInfo.fileName);
  } catch (error) {
    throw new Error("Download failed: " + error.message);
  }
}

export async function DownloadMultipleTracks(tracks, platform, quality, token, album, maxConcurrent = 3) {
  const results = [];
  const executing = new Set();
  var zip = new JSZip();
  var albumF = zip.folder(album);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  for (const track of tracks) {
    const filePromise = GetAndTagTrack(track, platform, quality, token);
    executing.add(filePromise);
    filePromise.finally(() => executing.delete(filePromise));
    results.push(
      filePromise.then(taggedBlob => {
        albumF.file(taggedBlob.fileName, taggedBlob.blob);
      })
    );

    if (executing.size >= maxConcurrent) {
      await Promise.race(executing);
    }

    // small awaited pause to avoid tight loop
    await sleep(150);
  }

  await Promise.allSettled(results);

  // Use JSZip streaming generation to reduce peak memory
  const content = await zip.generateAsync(
    { type: "blob", streamFiles: true },
  );

  saveAs(content, album + ".zip");
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

export async function GetAlbum(id, p) {
  return _get("album", { id, p });
}

export async function GetListened(token) {
  return _get("listened", { token });
}

export async function GetArtist(id, p) {
  return _get("artist", { id, p });
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

async function TagMp3File(inputFile, metadata) {
  try {
    // get mp3 bytes and cover bytes (if any)
    const mp3AB = await inputFile.arrayBuffer();
    const mp3Bytes = new Uint8Array(mp3AB);

    let imageData = null;
    if (metadata.cover) {
      // metadata.cover may be URL, data URL or Blob
      if (metadata.cover instanceof Blob) {
        imageData = await metadata.cover.arrayBuffer();
      } else if (typeof metadata.cover === 'string') {
        if (metadata.cover.startsWith('data:')) {
          // data URL -> ArrayBuffer
          const base64 = metadata.cover.split(',',2)[1] || '';
          const binary = atob(base64);
          const arr = new Uint8Array(binary.length);
          for (let i=0;i<binary.length;i++) arr[i] = binary.charCodeAt(i);
          imageData = arr.buffer;
        } else {
          // remote URL -> fetch
          const r = await fetch(metadata.cover);
          if (r.ok) {
            const b = await r.blob();
            imageData = await b.arrayBuffer();
          }
        }
      }
    }

    // create writer
    const writer = new ID3Writer(mp3Bytes.buffer);
    writer.setFrame('TIT2', metadata.title || '')
          .setFrame('TPE1', [metadata.artist || ''])
          .setFrame('TALB', metadata.album || '')
          .setFrame('TYER', metadata.year || '')
          .setFrame('TRCK', metadata.media_count > 0 ? metadata.media_count : '');

    if (imageData) {
      writer.setFrame('APIC', {
        type: 3,
        data: imageData,
        description: 'cover'
      });
    }

    writer.addTag();
    const taggedBlob = writer.getBlob();
    return taggedBlob;
  } catch (err) {
    console.warn('TagMp3File failed, returning original file', err);
    return inputFile;
  }
}

async function TagFlacFile(inputFile, metadata) {
  const res = await fetch(metadata.cover);
  if (!res.ok) throw new Error("Failed to fetch cover image");
  const blob = await res.blob();
  const coverBytes = new Uint8Array(await blob.arrayBuffer());

  const inputFileArray = new Uint8Array(await inputFile.arrayBuffer())
  
  const taggedFile = new Map([['input.flac', inputFileArray]]);
  const args = [
    `--set-tag=TITLE=${metadata.title || ''}`,
    `--set-tag=ARTIST=${metadata.artist || ''}`,
    `--set-tag=ALBUM=${metadata.album || ''}`,
    `--set-tag=DATE=${metadata.year || ''}`,
    `--set-tag=TRACKNUMBER=${metadata.media_count > 0 ? metadata.media_count : ''}`
  ];

  if (coverBytes) {
    // give the cover a filename and add an --import-picture-from argument
    taggedFile.set('cover.jpg', coverBytes);
    args.push(`--import-picture-from=cover.jpg`);
  }

  // final input filename argument
  args.push('input.flac');

  // call metaflac (ensure metaflac is loaded/dynamic imported elsewhere)
  const output = await metaflac(args, {
    inputFiles: taggedFile,
    outputFileNames: ['input.flac']
  });

  const fileOut = output.files.get('input.flac');
  const outUint8 = fileOut instanceof Uint8Array ? fileOut : new Uint8Array(fileOut);
  return new Blob([outUint8.slice().buffer]);
}