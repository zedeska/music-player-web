<script>
  import { UploadTrack, ValidateFlacFile } from "../App.js";
  
  export let userToken;
  
  let fileInput;
  let selectedFiles = null;
  let uploading = false;
  let uploadProgress = 0;
  let errors = [];
  let successMessage = '';
  let addMusic = false;

  function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    selectedFiles = files;
    errors = [];
    successMessage = '';
    
    if (files.length > 0) {
      files.forEach(element => {
        errors.push(...ValidateFlacFile(element));  
      });
    }
  }

  function clearSelection() {
    selectedFiles = null;
    errors = [];
    successMessage = '';
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async function handleUpload() {
    if (!selectedFiles || errors.length > 0) return;
    
    uploading = true;
    uploadProgress = 0;
    errors = [];
    successMessage = '';

    try {
      await UploadTrack(selectedFiles, userToken);
      successMessage = 'File uploaded successfully!';
      clearSelection();
    } catch (error) {
      errors = [error.message];
    } finally {
      uploading = false;
      uploadProgress = 0;
    }
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
</script>

<h2>Music</h2>
<button on:click={() => addMusic = !addMusic} class="mb-4 px-4 py-2 bg-black text-white rounded hover:bg-violet-700 border-1 border-violet-900">
  {addMusic ? 'Close Upload' : 'Add Music'}
</button>

{#if addMusic}
  <div class="m-auto">
    <h2 class="text-2xl font-bold mb-6">Upload FLAC Audio</h2>
    
    <!-- File Input -->
    <div class="mb-4">
      <label for="flac-upload" class="block text-sm font-medium mb-2">
        Select FLAC Audio File
      </label>
      <input
        bind:this={fileInput}
        multiple={true}
        id="flac-upload"
        type="file"
        accept="audio/flac,.flac"
        on:change={handleFileSelect}
        disabled={uploading}
        class="block w-full text-gray-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-1 file:text-sm file:font-semibold file:bg-black file:text-violet-600 hover:file:bg-violet-100 disabled:opacity-50"
      />
    </div>

    <!-- Selected File Info -->
    {#if selectedFiles}
      <div class="mb-4 p-4 border rounded-lg bg-black">
        <h3 class="font-semibold mb-2">Selected Files:</h3>
        {#each selectedFiles as selectedFile}
        <div class="text-sm space-y-1">
          <p><strong>Name:</strong> {selectedFile.name}</p>
          <p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p>
          <p><strong>Type:</strong> {selectedFile.type || 'Unknown'}</p>
        </div>
        {/each}
        <div class="mt-3 flex gap-2">
          <button
            on:click={handleUpload}
            disabled={uploading || errors.length > 0}
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
          
          <button
            on:click={clearSelection}
            disabled={uploading}
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </div>
    {/if}

    <!-- Upload Progress -->
    {#if uploading}
      <div class="upload-progress mb-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium">Uploading...</span>
          <span class="text-sm text-gray-500">{uploadProgress}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style="width: {uploadProgress}%"
          ></div>
        </div>
      </div>
    {/if}

    <!-- Error Messages -->
    {#if errors.length > 0}
      <div class="error-messages mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        <h4 class="font-semibold mb-1">Errors:</h4>
        <ul class="list-disc list-inside text-sm">
          {#each errors as error}
            <li>{error}</li>
          {/each}
        </ul>
      </div>
    {/if}

    <!-- Success Message -->
    {#if successMessage}
      <div class="success-message mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
        {successMessage}
      </div>
    {/if}

    <!-- File Requirements -->
    <div class="mt-6 p-4 bg-black border border-violet-900 rounded">
      <h4 class="font-semibold mb-2">File Requirements:</h4>
      <ul class="text-sm space-y-1">
        <li>• File must be in FLAC format (16bit/44.1kHz)</li>
        <li>• Maximum file size: 200MB</li>
        <li>• Only audio/flac MIME type accepted</li>
        <li>• File extension must be .flac</li>
      </ul>
    </div>
  </div>
{/if}