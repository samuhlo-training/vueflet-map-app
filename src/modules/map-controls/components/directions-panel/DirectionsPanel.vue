/**
 * DIRECTIONS PANEL - VERSIÓN COMPLETA
 * 
 * Panel completo para calcular rutas con:
 * - Selector de modo de transporte
 * - Inputs para origen y destino con autocompletado
 * - Botón para intercambiar origen/destino
 * - Posibilidad de añadir waypoints intermedios (futuro)
 * - Información de la ruta calculada
 * - Manejo de errores
 */

<template>
  <div class="z-999 absolute bg-white rounded-lg shadow-lg w-80 max-h-[90vh] overflow-y-auto">
    <!-- Header -->
    <div class="sticky top-0 bg-white border-b border-[#e5e7eb] px-4 py-3 z-10">
      <div class="flex items-center justify-between">
        <button
          @click="handleBackToSearch"
          class="text-[#4DB487] hover:text-[#35a372] font-medium text-sm transition-all duration-200 flex items-center gap-1"
        >
          <span>←</span>
          <span>Volver</span>
        </button>
        <h3 class="font-bold text-[#1f2937] text-lg">
          Direcciones
        </h3>
        <div class="w-16"></div> <!-- Spacer para centrar título -->
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="p-4 space-y-4">
      <!-- Selector de modo de transporte -->
      <TravelModeSelector
        v-model="localTravelMode"
        :show-label="true"
      />

      <!-- Inputs de origen y destino -->
      <div class="space-y-3">
        <!-- Input de origen -->
        <DirectionsInput
          v-model="originName"
          type="origin"
          placeholder="Elige punto de partida"
          :show-my-location-button="true"
          :show-remove-button="false"
          @place-selected="handleOriginSelected"
          @my-location="handleOriginMyLocation"
        />

        <!-- Botón intercambiar -->
        <div class="flex justify-center">
          <button
            @click="handleSwapOriginDestination"
            :disabled="!canSwap"
            type="button"
            class="p-2 rounded-full transition-all duration-200 transform hover:scale-110 cursor-pointer"
            :class="canSwap 
              ? 'bg-[#f3f4f6] text-[#4DB487] hover:bg-[#e5e7eb]' 
              : 'bg-[#f9fafb] text-[#9ca3af] cursor-not-allowed'"
            title="Intercambiar origen y destino"
          >
            <span class="text-lg">⇅</span>
          </button>
        </div>

        <!-- Input de destino -->
        <DirectionsInput
          v-model="destinationName"
          type="destination"
          placeholder="Elige destino"
          :show-my-location-button="false"
          :show-remove-button="false"
          @place-selected="handleDestinationSelected"
        />
      </div>

      <!-- Botón añadir parada (futuro) -->
      <!-- <button
        @click="handleAddWaypoint"
        type="button"
        class="w-full py-2 px-3 text-sm font-medium text-[#4DB487] border border-dashed border-[#4DB487] rounded-lg hover:bg-[#f0fdf4] transition-all duration-200"
      >
        + Añadir parada
      </button> -->

      <!-- Botón calcular ruta -->
      <button
        v-if="canCalculateRoute && !hasRoute"
        @click="handleCalculateRoute"
        :disabled="isCalculatingRoute"
        type="button"
        class="w-full py-3 px-4 text-sm font-bold text-white rounded-lg transition-all duration-200 shadow-md"
        :class="isCalculatingRoute
          ? 'bg-[#9ca3af] cursor-not-allowed'
          : 'bg-[#4DB487] hover:bg-[#35a372] hover:shadow-lg transform hover:scale-105 cursor-pointer'"
      >
        {{ isCalculatingRoute ? '⏳ Calculando ruta...' : '🗺️ Calcular ruta' }}
      </button>

      <!-- Botón recalcular (si ya hay ruta) -->
      <button
        v-if="hasRoute"
        @click="handleCalculateRoute"
        :disabled="isCalculatingRoute"
        type="button"
        class="w-full py-2 px-4 text-sm font-medium text-[#4DB487] border border-[#4DB487] rounded-lg hover:bg-[#f0fdf4] transition-all duration-200 cursor-pointer"
      >
        {{ isCalculatingRoute ? 'Recalculando...' : 'Recalcular ruta' }}
      </button>

      <!-- Mensaje si faltan datos -->
      <div
        v-if="!canCalculateRoute && !hasRoute"
        class="p-3 bg-[#fef3c7] border border-[#fbbf24] rounded-lg"
      >
        <p class="text-xs text-[#92400e]">
          ⚠️ {{ getMissingDataMessage() }}
        </p>
      </div>

      <!-- Información de la ruta -->
      <RouteInfo
        v-if="hasRoute || routingError"
        :route="currentRoute"
      />

      <!-- 🆕 Rutas alternativas -->
      <RouteAlternatives v-if="hasRoute" />

      <!-- Error -->
      <div
        v-if="routingError"
        class="p-3 bg-[#fee2e2] border border-[#ef4444] rounded-lg"
      >
        <p class="text-xs font-semibold text-[#991b1b] mb-1">
          ❌ Error al calcular la ruta
        </p>
        <p class="text-xs text-[#991b1b]">
          {{ routingError.message }}
        </p>
      </div>

      <!-- Botón limpiar -->
      <button
        v-if="hasRoute || originName || destinationName"
        @click="handleClearAll"
        type="button"
        class="w-full py-2 px-3 text-xs font-medium text-[#6b7280] border border-[#e5e7eb] rounded-lg hover:bg-[#f9fafb] transition-all duration-200 cursor-pointer"
      >
        🗑️ Limpiar todo
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoutingStore } from '@/modules/map/stores/routing.store';
import { usePlacesStore } from '@/modules/map/stores/places.store';
import TravelModeSelector from './TravelModeSelector.vue';
import DirectionsInput from './DirectionsInput.vue';
import RouteInfo from './RouteInfo.vue';
import RouteAlternatives from './RouteAlternatives.vue';
import type { Place } from '@/modules/map/interfaces/place.interfaces';

// ============================================
// STORES
// ============================================

const routingStore = useRoutingStore();
const placesStore = usePlacesStore();

// ============================================
// STATE
// ============================================

const originName = ref('');
const destinationName = ref('');
const localTravelMode = computed({
  get: () => routingStore.travelMode,
  set: (value) => {
    routingStore.setTravelMode(value);
  
  },
});

// ============================================
// COMPUTED
// ============================================

const originWaypoint = computed(() => routingStore.originWaypoint);
const destinationWaypoint = computed(() => routingStore.destinationWaypoint);
const canCalculateRoute = computed(() => routingStore.canCalculateRoute);
const isCalculatingRoute = computed(() => routingStore.isCalculatingRoute);
const hasRoute = computed(() => routingStore.hasRoute);
const currentRoute = computed(() => routingStore.currentRoute);
const routingError = computed(() => routingStore.routingError);

const canSwap = computed(() => {
  return originWaypoint.value !== undefined && destinationWaypoint.value !== undefined;
});

// ============================================
// WATCHERS
// ============================================

/**
 * Sincronizar nombres con los waypoints del store
 */
watch(originWaypoint, (waypoint) => {
  if (waypoint) {
    originName.value = waypoint.name;
  } else {
    originName.value = '';
  }
}, { immediate: true });

watch(destinationWaypoint, (waypoint) => {
  if (waypoint) {
    destinationName.value = waypoint.name;
  } else {
    destinationName.value = '';
  }
}, { immediate: true });

// ============================================
// METHODS
// ============================================

/**
 * handleBackToSearch: Volver al modo de búsqueda
 */
const handleBackToSearch = () => {
  routingStore.setSearchMode();
};

/**
 * handleOriginSelected: Cuando se selecciona un origen del autocompletado
 */
const handleOriginSelected = (place: Place) => {
  const [lat, lon] = place.coordinates;
  routingStore.setOrigin(place.name, [lat, lon], place.id);
  
  // Si ya hay destino, calcular ruta automáticamente
  if (destinationWaypoint.value) {
    routingStore.calculateRoute();
  }
};

/**
 * handleDestinationSelected: Cuando se selecciona un destino del autocompletado
 */
const handleDestinationSelected = (place: Place) => {
  const [lat, lon] = place.coordinates;
  routingStore.setDestination(place.name, [lat, lon], place.id);
  
};

/**
 * handleOriginMyLocation: Cuando se hace click en "Mi ubicación"
 */
const handleOriginMyLocation = () => {
  if (placesStore.isUserLocationReady && placesStore.userLocation) {
    const [lat, lon] = placesStore.userLocation;
    routingStore.setOrigin('Mi ubicación', [lat, lon]);
    originName.value = 'Mi ubicación';
    
    
  } else {
    alert('No se pudo obtener tu ubicación. Asegúrate de dar permisos de ubicación.');
  }
};

/**
 * handleSwapOriginDestination: Intercambiar origen y destino
 */
const handleSwapOriginDestination = () => {
  if (!canSwap.value) return;
  
  routingStore.swapOriginDestination();
  
 
};

/**
 * handleCalculateRoute: Calcular la ruta
 */
const handleCalculateRoute = () => {
  routingStore.calculateRoute();
};

/**
 * handleClearAll: Limpiar todo
 */
const handleClearAll = () => {
  routingStore.clearRoute();
  originName.value = '';
  destinationName.value = '';
};

/**
 * getMissingDataMessage: Mensaje de qué falta
 */
const getMissingDataMessage = (): string => {
  if (!originWaypoint.value && !destinationWaypoint.value) {
    return 'Establece un origen y un destino para calcular la ruta';
  } else if (!originWaypoint.value) {
    return 'Establece un punto de partida';
  } else if (!destinationWaypoint.value) {
    return 'Establece un destino';
  }
  return '';
};
</script>

<style scoped>
/* Scroll personalizado */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #4DB487 #f3f4f6;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4DB487;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #35a372;
}
</style>
