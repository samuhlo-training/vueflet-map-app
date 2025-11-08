<template>
    <div class="z-999 absolute  bg-white p-2 rounded shadow w-64 ">
        <input 
            type="text" 
            placeholder="Buscar lugares ..." 
            class="border p-2 rounded w-full"
            @input="handleSearch"
        />
  

    <SearchResults />
      </div>
</template>

<script setup lang="ts">
import { useSearchBar } from './SearchBar';
import SearchResults from './SearchResults.vue';

const { handleSearch } = useSearchBar();
</script>