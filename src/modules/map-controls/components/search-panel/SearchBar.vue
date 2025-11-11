<template>
  <!-- Modo de búsqueda normal -->
  <div v-if="!isDirectionsMode" class="z-999 absolute bg-white p-2 rounded shadow w-64">
    <input 
      type="text" 
      placeholder="Buscar lugares..." 
      class="border p-2 rounded w-full"
      @input="handleSearch"
    />
    
    <SearchResults />
  </div>

  <!-- Modo de direcciones -->
  <DirectionsPanel v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSearchBar } from '../../composables/useSearchBar';
import { useRoutingStore } from '@/modules/map/stores/routing.store';
import SearchResults from './SearchResults.vue';
import DirectionsPanel from '../directions-panel/DirectionsPanel.vue';

const { handleSearch } = useSearchBar();

// Store de routing para saber en qué modo estamos
const routingStore = useRoutingStore();
const isDirectionsMode = computed(() => routingStore.isDirectionsMode);
</script>