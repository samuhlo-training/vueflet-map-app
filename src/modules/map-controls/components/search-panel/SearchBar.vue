/**
 * SEARCH BAR - BARRA DE BÚSQUEDA PRINCIPAL
 * 
 * Barra de búsqueda que alterna entre dos modos:
 * - Modo búsqueda: input para buscar lugares con resultados
 * - Modo direcciones: panel completo de direcciones
 * - Integración con composables de búsqueda
 * - Gestión de estado de routing
 */

<template>
  <!-- Modo de búsqueda normal -->
  <div v-if="!isDirectionsMode" class="z-999 absolute bg-white p-2 rounded shadow w-64">
    <input 
      type="text" 
      placeholder="Buscar lugares..." 
      class="border border-primary p-2 rounded w-full focus:border-primary outline-none transition-all duration-200"
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