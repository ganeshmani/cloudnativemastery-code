<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  import { PUBLIC_API_URL } from "$env/static/public";
  import { DownloadCloud, Trash2, CircleDashed } from "lucide-svelte";
  export let files: any[] = [];

  const handleDownload = (file: any) => {
    // download file using s3 url
    window.open(file.url, "_blank");
  };

  const handleDelete = async (file: any) => {
    const response = await fetch(`${PUBLIC_API_URL}/file/${file.id}`, {
      method: "DELETE",
    });

    const data = await response.json();
    console.log("data", data);

    if (response.status === 200) {
      console.log("coming inside delete");
      // files = files.filter((f) => f.id !== file.id);
      dispatch("delete", file.id);
    }
  };

  function getReadableFileSizeString(fileSizeInBytes: any) {
    var i = -1;
    var byteUnits = [" kB", " MB", " GB", " TB", "PB", "EB", "ZB", "YB"];
    do {
      fileSizeInBytes /= 1024;
      i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
  }
</script>

<div class="container space-y-2">
  {#each files as file}
    <div
      class="flex justify-between py-2 px-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
    >
      <div>
        <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-300">
          {file.originalFileName}
        </h4>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {`Uploaded file size: ${getReadableFileSizeString(file.size)}`}
        </p>
      </div>

      <div class="flex items-center">
        <button
          on:click={() => {
            handleDelete(file);
          }}
        >
          <Trash2 class="cursor-pointer mx-1" />
        </button>
        {#if file.isUploaded}
          <button
            on:click={() => {
              handleDownload(file);
            }}
          >
            <DownloadCloud class="cursor-pointer mx-1" />
          </button>
        {:else}
          <CircleDashed />
        {/if}
      </div>
    </div>{/each}
</div>
