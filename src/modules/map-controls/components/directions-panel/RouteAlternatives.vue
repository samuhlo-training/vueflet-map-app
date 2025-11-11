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
          : 'border-[#e5e7eb] bg-white hover:border-[#42b983] hover:bg-[#f9fafb] cursor-pointer'"
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

import { useRoutesAlternatives } from '../../composables/useRoutesAlternatives';
const { 
  allRoutes, 
  hasAlternatives, 
  formatDistance, 
  formatDuration, 
  formatDistanceDifference, 
  formatTimeDifference, 
  handleSelectRoute 
} = useRoutesAlternatives();

</script>
