<template>
  <!-- Modo de búsqueda normal -->
  <div v-if="!isDirectionsMode" class="z-999 absolute bg-white p-2 rounded shadow w-64">
    <input 
      type="text" 
      placeholder="Buscar lugares..." 
      class="border border-[#4DB487] p-2 rounded w-full focus:border-[#374C61] outline-none transition-all duration-200"
      @input="handleSearchInput"
    />
    
    <SearchResults />
  </div>

  <!-- Modo de direcciones -->
  <DirectionsPanel v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePlaceSearch } from '../../composables/usePlaceSearch';
import { useRoutingStore } from '@/modules/map/stores/routing.store';
import SearchResults from './SearchResults.vue';
import DirectionsPanel from '../directions-panel/DirectionsPanel.vue';

const { handleSearchInput } = usePlaceSearch({ debounceMs: 500 });

// Store de routing para saber en qué modo estamos
const routingStore = useRoutingStore();
const isDirectionsMode = computed(() => routingStore.isDirectionsMode);
</script>