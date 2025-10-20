<script>
  import { GetPlaylist } from "../App.js";
  import toast from "svelte-french-toast";
  import TrackElement from "../components/TrackElement.svelte";
  import { push } from "svelte-spa-router";

    export let params;
    export let downloadTrack;
    export let playAlbum;
    export let downloadAlbum;
    export let addToQueue;
    export let getUsersPlaylists;
    export let addTrackToPlaylist;
    export let deleteTrackFromPlaylist;
    export let deletePlaylist;

    let playlistData = null;

    async function fetchPlaylist(id) {
        if (!id || id === 0) {
            toast.error("Playlist ID is not provided.");
            return;
        }
        
        try {
            const result = await GetPlaylist(id);
            playlistData = result;
        } catch (error) {
            toast.error("Error fetching playlist data");
            return;
        }
    }

    $: fetchPlaylist(params.id);
</script>

{#if playlistData}
    <div class="flex flex-row gap-3 border-b-2 border-gray-800 pb-2">

        <div class="grid grid-rows-3 p-2 w-full">
            <h2 class="text-7xl font-bold row-start-2 overflow-hidden text-ellipsis whitespace-nowrap" >{playlistData.name}</h2>
            <div class="row-start-3 grid grid-cols-3">
                <div class="self-end flex gap-2">
                    <p class="self-end" > {playlistData.tracks ? playlistData.tracks.length : 0} Tracks</p>
                    <div>
                        <button class="cursor-pointer" on:click={async () => {
                            if (window.confirm("Delete this playlist?")) {
                                await deletePlaylist(playlistData.id);
                                await getUsersPlaylists(true);
                                push("/");
                            }
                        }}>
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                        <button class="cursor-pointer" on:click={() => {downloadAlbum(playlistData.tracks, 0, 0, playlistData.name)}}>
                            <i class="fa-solid fa-download"></i>
                        </button>
                    </div>
                </div>
                <i on:click={() => {playAlbum(playlistData.tracks)}} class="justify-self-end self-end fa-solid fa-circle-play text-5xl mt-3 cursor-pointer text-violet-900 col-start-3"></i>
            </div>
        </div>
    </div>

    <div>
        {#if playlistData.tracks}
          {#each playlistData.tracks as track}
              <TrackElement {track} {downloadTrack} {addToQueue} {getUsersPlaylists} {addTrackToPlaylist} tracksData={playlistData.tracks} {playAlbum} {deleteTrackFromPlaylist} playlistID={playlistData.id} numbered={true}></TrackElement>
          {/each}
        {/if}
    </div>
{/if}