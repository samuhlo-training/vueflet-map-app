/**
 * SEARCH RESULTS - RESULTADOS DE BÚSQUEDA
 * 
 * Componente que muestra los resultados de búsqueda de lugares con:
 * - Lista de lugares encontrados
 * - Información detallada de cada lugar
 * - Botón para calcular ruta hacia el lugar
 * - Indicador visual del lugar activo
 * - Manejo de estados de carga
 */

<template>
  <ul v-if="results.length > 0" class="mt-3 max-h-80 overflow-y-auto rounded-lg border border-[#e5e7eb]">
    <li
      v-for="place in results"
      :key="place.id"
      class="border-b border-[#f3f4f6] px-4 py-3 transition-all duration-200"
      :class="{
        'bg-[#d1fae5] border-[#4DB487]': place.id === activePlace,
        'hover:bg-[#f0fdf4]': place.id !== activePlace
      }"
    >
      <!-- Información del lugar - clickeable -->
      <div 
        @click="onPlaceClick(place.id)"
        class="cursor-pointer"
      >
        <h5 class="font-semibold text-[#1f2937] text-sm mb-1">{{ place.name }}</h5>
        <p class="text-[#6b7280] text-xs mb-3">{{ place.display_name }}</p>
      </div>

      <!-- Botones de acción -->
      <div class="flex gap-2 justify-end">
        <!-- Botón: Cómo llegar -->
        <button 
          @click.stop="handleGetDirections(place.id)"
          class="px-3 py-1.5 text-xs font-medium text-white rounded transition-all duration-200 bg-[#4DB487] hover:bg-[#35a372] hover:shadow-lg cursor-pointer"
          title="Calcular ruta hacia este lugar"
        >
          Cómo llegar
        </button>

       
      </div>
    </li>
  </ul>

  <div v-else-if="isSearching" class="mt-3 text-center text-[#6b7280] text-sm">
    Buscando lugares...
  </div>
</template>

<script setup lang="ts">
import { useSearchResults } from '../../composables/useSearchResults';

// Importar todas las funciones del composable
const { 
  results, 
  isSearching, 
  onPlaceClick, 
  activePlace,
  handleGetDirections // Nueva función
} = useSearchResults();
</script>
