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
  <div v-if="!isDirectionsMode" class="z-999 absolute bg-white p-2 rounded shadow w-80">
    <div class="relative flex items-center gap-2">
      <input 
        type="text" 
        placeholder="Buscar lugares..." 
        class=" border-2 border-primary p-2 rounded w-full focus:border-gray-darker outline-none transition-all duration-200"
        @input="handleSearchInput"
      />
      
      <!-- Botón de mi ubicación -->
      <button
        @click="centerMapOnUserLocation"
        class="shrink-0 p-1 px-2 text-primary bg-white rounded hover:shadow-lg hover:bg-gray-darker hover:text-white transition-all duration-200 cursor-pointer group relative"
        title="Centrar en mi ubicación"
      >
        <i class="material-icons text-xl pt-1">my_location</i>
        
        <!-- Tooltip -->
        <span class="absolute top-full right-0 mt-2 px-2 py-1 text-xs text-white bg-gray-darker rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Centrar en mi ubicación
        </span>
      </button>
    </div>
    
    <SearchResults />
  </div>

  <!-- Modo de direcciones -->
  <DirectionsPanel v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePlaceSearch } from '../../composables/usePlaceSearch';
import { useRoutingStore } from '@/modules/map/stores/routing.store';
import { useMapStore } from '@/modules/map/stores/map.store';
import { usePlacesStore } from '@/modules/map/stores/places.store';
import SearchResults from './SearchResults.vue';
import DirectionsPanel from '../directions-panel/DirectionsPanel.vue';

const { handleSearchInput } = usePlaceSearch({ debounceMs: 500 });

// Stores
const routingStore = useRoutingStore();
const mapStore = useMapStore();
const placesStore = usePlacesStore();

const isDirectionsMode = computed(() => routingStore.isDirectionsMode);

// Función para centrar el mapa en la ubicación del usuario
const centerMapOnUserLocation = () => {
  const userLocation = placesStore.userLocation;
  if (userLocation) {
    mapStore.setCenterWithAnimation(userLocation[0], userLocation[1], 18, 1800);
  }
};
</script>