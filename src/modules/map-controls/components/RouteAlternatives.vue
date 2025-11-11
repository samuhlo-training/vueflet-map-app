/**
 * ROUTE ALTERNATIVES
 * 
 * Componente para mostrar y seleccionar entre rutas alternativas.
 * Muestra una lista de tarjetas con información de cada ruta:
 * - Distancia
 * - Duración
 * - Indicador visual de cuál está seleccionada
 */

<template>
  <div v-if="hasAlternatives" class="space-y-2">
    <!-- Título -->
    <h4 class="text-sm font-semibold text-[#1f2937] px-1">
      Rutas disponibles
    </h4>

    <!-- Lista de todas las rutas -->
    <div class="space-y-2">
      <div
        v-for="routeInfo in allRoutes"
        :key="`route-${routeInfo.index}`"
        @click="handleSelectRoute(routeInfo.index)"
        class="relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer"
        :class="routeInfo.route.isSelected 
          ? 'border-[#42b983] bg-[#f0fdf4]' 
          : 'border-[#e5e7eb] bg-white hover:border-[#42b983] hover:bg-[#f9fafb]'"
      >
        <!-- Badge superior -->
        <div class="flex items-start justify-between mb-2">
          <span 
            class="text-xs font-bold px-2 py-1 rounded-full"
            :class="routeInfo.route.isSelected 
              ? 'bg-[#42b983] text-white' 
              : 'bg-[#e5e7eb] text-[#6b7280]'"
          >
            <template v-if="routeInfo.isFastest">
              ⚡ Más rápida
            </template>
            <template v-else-if="!routeInfo.isAlternative">
              Ruta actual
            </template>
            <template v-else>
              Alternativa {{ routeInfo.index + 1 }}
            </template>
          </span>
          <!-- Checkmark si está seleccionada -->
          <span v-if="routeInfo.route.isSelected" class="text-[#42b983] text-lg">✓</span>
        </div>

        <!-- Información de la ruta -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 ml-1">
           
            <div>
              <p class="text-sm font-bold text-[#1f2937]">
                {{ formatDuration(routeInfo.route.duration) }}
              </p>
              <p class="text-xs text-[#6b7280]">
                {{ formatDistance(routeInfo.route.distance) }}
              </p>
            </div>
          </div>

          <!-- Diferencia con la más rápida (solo si no es la más rápida) -->
          <div v-if="!routeInfo.isFastest" class="text-right">
            <p class="text-xs" 
               :class="routeInfo.timeDiff > 0 ? 'text-[#ef4444]' : 'text-[#10b981]'">
              {{ formatTimeDifference(routeInfo.timeDiff) }}
            </p>
            <p class="text-xs text-[#6b7280]">
              {{ formatDistanceDifference(routeInfo.distanceDiff) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoutingStore } from '@/modules/map/stores/routing.store';

const routingStore = useRoutingStore();

// ============================================
// COMPUTED
// ============================================

const currentRoute = computed(() => routingStore.currentRoute);
const alternativeRoutes = computed(() => routingStore.alternativeRoutes);

/**
 * hasAlternatives: ¿Hay rutas alternativas disponibles?
 */
const hasAlternatives = computed(() => {
  return alternativeRoutes.value && alternativeRoutes.value.length > 0;
});

/**
 * allRoutes: Todas las rutas (principal + alternativas) con info adicional
 * ORDENADAS de más rápida a más lenta
 */
const allRoutes = computed(() => {
  if (!currentRoute.value) return [];
  
  const routes = [
    { 
      route: currentRoute.value, 
      index: -1, 
      isAlternative: false 
    },
    ...alternativeRoutes.value.map((route, index) => ({ 
      route, 
      index, 
      isAlternative: true 
    }))
  ];
  
  // Encontrar la ruta más rápida
  const fastestDuration = Math.min(...routes.map(r => r.route.duration));
  
  const routesWithInfo = routes.map(r => ({
    ...r,
    isFastest: r.route.duration === fastestDuration,
    timeDiff: r.route.duration - fastestDuration,
    distanceDiff: r.route.distance - routes.find(fr => fr.route.duration === fastestDuration)!.route.distance
  }));
  
  // Ordenar por duración (más rápida primero)
  return routesWithInfo.sort((a, b) => a.route.duration - b.route.duration);
});

// ============================================
// METHODS
// ============================================

/**
 * handleSelectRoute: Selecciona una ruta
 * @param index - Índice de la alternativa (-1 = principal, 0+ = alternativas)
 */
const handleSelectRoute = (index: number) => {
  // Siempre llamar al store con el índice
  // El store se encarga de actualizar los flags isSelected correctamente
  routingStore.selectAlternativeRoute(index);
};



/**
 * formatDuration: Formatea la duración en formato legible
 */
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
};

/**
 * formatDistance: Formatea la distancia en formato legible
 */
const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
};

/**
 * formatTimeDifference: Formatea la diferencia de tiempo
 */
const formatTimeDifference = (diffSeconds: number): string => {
  const absMinutes = Math.abs(Math.floor(diffSeconds / 60));
  const sign = diffSeconds >= 0 ? '+' : '-';
  
  if (absMinutes < 1) return `${sign}<1 min`;
  if (absMinutes < 60) return `${sign}${absMinutes} min`;
  
  const hours = Math.floor(absMinutes / 60);
  const remainingMinutes = absMinutes % 60;
  return `${sign}${hours}h ${remainingMinutes}min`;
};

/**
 * formatDistanceDifference: Formatea la diferencia de distancia
 */
const formatDistanceDifference = (diffMeters: number): string => {
  const absMeters = Math.abs(diffMeters);
  const sign = diffMeters >= 0 ? '+' : '-';
  
  if (absMeters >= 1000) {
    return `${sign}${(absMeters / 1000).toFixed(1)} km`;
  }
  return `${sign}${Math.round(absMeters)} m`;
};
</script>
