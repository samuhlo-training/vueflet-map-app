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
      Rutas alternativas
    </h4>

    <!-- Lista de rutas (principal + alternativas) -->
    <div class="space-y-2">
      <!-- Ruta principal -->
      <div
        v-if="currentRoute"
        @click="handleSelectRoute(-1)"
        class="relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer"
        :class="isMainRouteSelected 
          ? 'border-[#42b983] bg-[#f0fdf4]' 
          : 'border-[#e5e7eb] bg-white hover:border-[#42b983] hover:bg-[#f9fafb]'"
      >
        <!-- Badge "Recomendada" -->
        <div class="flex items-start justify-between mb-2">
          <span class="text-xs font-bold px-2 py-1 rounded-full"
                :class="isMainRouteSelected 
                  ? 'bg-[#42b983] text-white' 
                  : 'bg-[#e5e7eb] text-[#6b7280]'">
            ⚡ Más rápida
          </span>
          <!-- Checkmark si está seleccionada -->
          <span v-if="isMainRouteSelected" class="text-[#42b983] text-lg">✓</span>
        </div>

        <!-- Información de la ruta -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-2xl">{{ getTravelModeIcon(currentRoute.travelMode) }}</span>
            <div>
              <p class="text-sm font-bold text-[#1f2937]">
                {{ formatDuration(currentRoute.duration) }}
              </p>
              <p class="text-xs text-[#6b7280]">
                {{ formatDistance(currentRoute.distance) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Rutas alternativas -->
      <div
        v-for="(route, index) in alternativeRoutes"
        :key="`alt-${index}`"
        @click="handleSelectRoute(index)"
        class="relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer"
        :class="route.isSelected 
          ? 'border-[#42b983] bg-[#f0fdf4]' 
          : 'border-[#e5e7eb] bg-white hover:border-[#42b983] hover:bg-[#f9fafb]'"
      >
        <!-- Badge "Alternativa" -->
        <div class="flex items-start justify-between mb-2">
          <span class="text-xs font-medium px-2 py-1 rounded-full bg-[#e5e7eb] text-[#6b7280]">
            Alternativa {{ index + 1 }}
          </span>
          <!-- Checkmark si está seleccionada -->
          <span v-if="route.isSelected" class="text-[#42b983] text-lg">✓</span>
        </div>

        <!-- Información de la ruta -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-2xl">{{ getTravelModeIcon(route.travelMode) }}</span>
            <div>
              <p class="text-sm font-bold text-[#1f2937]">
                {{ formatDuration(route.duration) }}
              </p>
              <p class="text-xs text-[#6b7280]">
                {{ formatDistance(route.distance) }}
              </p>
            </div>
          </div>

          <!-- Diferencia con la principal -->
          <div v-if="currentRoute" class="text-right">
            <p class="text-xs text-[#ef4444]">
              +{{ formatTimeDifference(route.duration, currentRoute.duration) }}
            </p>
            <p class="text-xs text-[#6b7280]">
              +{{ formatDistanceDifference(route.distance, currentRoute.distance) }}
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
import type { TravelMode } from '@/modules/map/interfaces/routing.interfaces';

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
 * isMainRouteSelected: ¿La ruta principal está seleccionada?
 */
const isMainRouteSelected = computed(() => {
  return currentRoute.value?.isSelected !== false;
});

// ============================================
// METHODS
// ============================================

/**
 * handleSelectRoute: Selecciona una ruta
 * @param index - Índice de la alternativa (-1 = principal, 0+ = alternativas)
 */
const handleSelectRoute = (index: number) => {
  if (index === -1) {
    // Si ya está seleccionada la principal, no hacer nada
    if (isMainRouteSelected.value) return;
    
    // Buscar cuál alternativa está seleccionada actualmente
    const selectedAltIndex = alternativeRoutes.value.findIndex(r => r.isSelected);
    if (selectedAltIndex !== -1) {
      // Intercambiar con esa alternativa (volver a la principal)
      routingStore.selectAlternativeRoute(selectedAltIndex);
    }
  } else {
    // Seleccionar una alternativa
    routingStore.selectAlternativeRoute(index);
  }
};

/**
 * getTravelModeIcon: Icono según modo de transporte
 */
const getTravelModeIcon = (mode: TravelMode): string => {
  const icons = {
    driving: '🚗',
    cycling: '🚴',
    walking: '🚶',
  };
  return icons[mode] || '🚗';
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
const formatTimeDifference = (duration1: number, duration2: number): string => {
  const diff = Math.abs(duration1 - duration2);
  const minutes = Math.floor(diff / 60);
  
  if (minutes < 1) return '<1 min';
  if (minutes < 60) return `${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * formatDistanceDifference: Formatea la diferencia de distancia
 */
const formatDistanceDifference = (distance1: number, distance2: number): string => {
  const diff = Math.abs(distance1 - distance2);
  
  if (diff >= 1000) {
    return `${(diff / 1000).toFixed(1)} km`;
  }
  return `${Math.round(diff)} m`;
};
</script>
