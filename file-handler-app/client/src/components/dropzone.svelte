<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  let files: any = [];

  $: {
    if (files.length > 0) {
      dispatch("files", files);
    }
  }
</script>

<div class="flex flex-col items-center justify-center w-full space-y-4">
  <label
    for="dropzone-file"
    class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
  >
    <div class="flex flex-col items-center justify-center pt-5 pb-6">
      <svg
        class="w-10 h-10 mb-3 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        ></path></svg
      >
      <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
        <span class="font-semibold">Click to upload</span> or drag and drop
      </p>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        SVG, PNG, JPG or GIF (MAX. 800x400px)
      </p>
    </div>
    <input id="dropzone-file" bind:files type="file" class="hidden" />
  </label>

  <!-- Display selected files -->
  <div class="w-full">
    <ul class="space-y-2">
      {#each files as file, index}
        {console.log("file", file)}
        <li class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">{index + 1}.</span>
          {#if file.type.startsWith("image/")}
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              class="w-10 h-10 object-cover rounded-md"
            />
          {:else}
            <svg class="w-10 h-10 text-gray-400" fill="currentColor"></svg>
          {/if}
          <span>{file.name}</span>
          <span class="text-sm text-gray-500"
            >({(file.size / 1024).toFixed(2)} KB)</span
          >
        </li>
      {/each}
    </ul>
  </div>
</div>
