<script lang="ts">
  import { onMount } from "svelte";
  import { PUBLIC_API_URL } from "$env/static/public";

  import { uploadToS3 } from "$lib/upload-to-s3";
  import Dropzone from "../components/dropzone.svelte";
  import FileList from "../components/file-list.svelte";

  import { getFiles } from "../api/get-file";

  let file: any;
  let files: any[] = [];
  let isUploading = false;

  async function fetchFiles() {
    const response = await getFiles();

    files = response.files;
  }

  onMount(() => {
    fetchFiles();
  });

  function handleFiles(event: any) {
    console.log("event.detail", event.detail);
    file = event.detail;
  }

  function handleDelete() {
    fetchFiles();
  }

  async function _handleUpload(file: any) {
    isUploading = true;
    const filesData = [...file].map((file: File) => {
      return {
        file_name: file.name,
        content_type: file.type,
        size: file.size,
        isUploaded: false,
        progress: 0,
      };
    });

    const response = await fetch(`${PUBLIC_API_URL}/get-url`, {
      method: "POST",
      body: JSON.stringify(filesData[0]),
    });

    const myPollingInterval = setInterval(async () => {
      await fetchFiles();

      const isAnyFileUploading = files.some((file) => !file.isUploaded);

      if (!isAnyFileUploading) {
        clearInterval(myPollingInterval);
        file = null;
      }
    }, 3000);

    const data = await response.json();

    await uploadToS3(file[0], data.url);

    isUploading = false;
    file = null;
  }
</script>

<div class="flex container my-4">
  <div class="w-2/3">
    <h2 class="h2 text-xl font-semibold py-2">Uploaded Files</h2>

    <FileList {files} on:delete={handleDelete} />
  </div>

  <div class="w-1/3">
    <h2 class="text-xl font-semibold">Drop your files here</h2>
    <Dropzone
      on:files={handleFiles}
      {isUploading}
      on:upload={() => _handleUpload(file)}
    />
  </div>
</div>
