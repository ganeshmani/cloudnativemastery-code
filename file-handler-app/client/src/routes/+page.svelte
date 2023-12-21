<script lang="ts">
  import { onMount } from "svelte";

  import { uploadToS3 } from "$lib/upload-to-s3";
  import Dropzone from "../components/dropzone.svelte";
  import FileList from "../components/file-list.svelte";

  import { getFiles } from "../api/get-file";

  let file: any;
  let files: any[] = [];

  async function fetchFiles() {
    const response = await getFiles();
    console.log("response data", response);
    files = response.files;
  }

  onMount(() => {
    console.log("on mount");

    fetchFiles();
  });

  function handleFiles(event: any) {
    file = event.detail;
  }

  async function _handleUpload(file: any) {
    const filesData = [...file].map((file: File) => {
      return {
        file_name: file.name,
        content_type: file.type,
        size: file.size,
        isUploaded: false,
        progress: 0,
      };
    });

    const response = await fetch(
      "https://zvpyqtm84h.execute-api.us-east-1.amazonaws.com/get-url",
      {
        method: "POST",
        body: JSON.stringify(filesData[0]),
      }
    );

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
    // console.log("done uploading");
    // clearInterval(myPollingInterval);
    // console.log("done polling");
    // await fetchFiles();  // this is not working
  }
</script>

<div class="flex container my-4">
  <div class="w-2/3">
    <h2 class="h2 text-xl font-semibold py-2">Uploaded Files</h2>

    <FileList {files} />
  </div>

  <div class="w-1/3">
    <h2 class="text-xl font-semibold">Drop your files here</h2>
    <Dropzone on:files={handleFiles} />

    <button
      type="button"
      on:click={() => _handleUpload(file)}
      class="w-full my-4 text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
      >Upload</button
    >
  </div>
</div>
