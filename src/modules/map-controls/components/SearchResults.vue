<template>
  <ul v-if="results.length > 0" class="mt-3 max-h-80 overflow-y-auto rounded-lg border border-[#e5e7eb]">
    <li
      v-for="place in results"
      :key="place.id"
      @click="onPlaceClick(place.id)"
      class="cursor-pointer border-b border-[#f3f4f6] px-4 py-3 transition-all duration-200"
      :class="{
        'bg-[#d1fae5] border-[#42b983]': place.id === activePlace,
        'hover:bg-[#f0fdf4] hover:border-b-[#42b983]': place.id !== activePlace
      }"
    >
      <h5 class="font-semibold text-[#1f2937] text-sm mb-1">{{ place.name }}</h5>
      <p class="text-[#6b7280] text-xs mb-3">{{ place.display_name }}</p>
      <div class="flex justify-end">
        <button 
          class="px-3 py-1.5 text-xs font-medium text-white rounded transition-all duration-200"
          :class="place.place_id === activePlace 
            ? 'bg-[#42b983] shadow-lg' 
            : 'bg-linear-to-r from-[#42b983] to-[#35495E] hover:shadow-lg hover:from-[#35a372] hover:to-[#2d3d4d]'"
        >
          Direcciones
        </button>
      </div>
    </li>
  </ul>

  <div v-else-if="isSearching" class="mt-3 text-center text-[#6b7280] text-sm">
    Buscando lugares...
  </div>

  
</template>

<script setup lang="ts">
import { useSearchResults } from './SearchResults.ts';
const { results, isSearching, onPlaceClick, activePlace } = useSearchResults();
</script>
