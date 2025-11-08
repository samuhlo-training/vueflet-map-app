<template>
    <div class="z-999 absolute  bg-white p-2 rounded shadow w-64 ">
        <input type="text" placeholder="Buscar lugares ..." class="border p-2 rounded w-full" />
  

    <SearchResults />
      </div>
</template>

<script setup lang="ts">
import { searchResults } from './SearchResults.ts';
import SearchResults from './SearchResults.vue';


</script>