/**
 * ROUTE INFO
 * 
 * Componente para mostrar la información de una ruta calculada:
 * - Distancia total
 * - Tiempo estimado
 * - Instrucciones paso a paso (opcional, plegable)
 * 
 * Muestra los datos de forma clara y atractiva visualmente.
 */

<template>
  <div v-if="route" class="space-y-3">
    <!-- Resumen de la ruta -->
    <div class="bg-[#f0fdf4] border border-[#42b983] rounded-lg p-4">
      <h4 class="text-xs font-medium text-[#6b7280] mb-3">
        Ruta calculada
      </h4>
      
      <div class="grid grid-cols-2 gap-3">
        <!-- Distancia -->
        <div class="flex items-center gap-2">
          <span class="text-xl"></span>
          <div>
            <p class="text-xs text-[#6b7280]">Distancia</p>
            <p class="text-lg font-bold text-[#1f2937]">{{ formattedDistance }}</p>
          </div>
        </div>
        
        <!-- Duración -->
        <div class="flex items-center gap-2">
          <span class="text-xl"></span>
          <div>
            <p class="text-xs text-[#6b7280]">Tiempo</p>
            <p class="text-lg font-bold text-[#1f2937]">{{ formattedDuration }}</p>
          </div>
        </div>
      </div>

      <!-- Modo de transporte -->
      <div class="mt-3 pt-3 border-t border-[#d1fae5]">
        <p class="text-xs text-[#6b7280]">
          {{ getTravelModeText() }}
        </p>
      </div>
    </div>

    <!-- Botón para ver instrucciones -->
    <button
      v-if="showInstructionsToggle"
      @click="toggleInstructions"
      type="button"
      class="w-full py-2 px-3 text-sm font-medium text-[#42b983] bg-white border border-[#42b983] rounded-lg hover:bg-[#f0fdf4] transition-all duration-200 flex items-center justify-between"
    >
      <span>{{ instructionsExpanded ? 'Ocultar' : 'Ver' }} instrucciones</span>
      <span class="transform transition-transform duration-200" :class="{ 'rotate-180': instructionsExpanded }">
        ▼
      </span>
    </button>

    <!-- Instrucciones detalladas (plegable) -->
    <div
      v-if="instructionsExpanded && route.segments.length > 0"
      class="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden"
    >
      <div class="max-h-64 overflow-y-auto">
        <div
          v-for="(segment, index) in route.segments"
          :key="index"
          class="px-4 py-3 border-b border-[#f3f4f6] last:border-b-0 hover:bg-[#f9fafb] transition-all duration-200"
        >
          <div class="flex items-start gap-3">
            <!-- Número del paso -->
            <div class="shrink-0 w-6 h-6 rounded-full bg-[#42b983] text-white text-xs font-bold flex items-center justify-center mt-0.5">
              {{ index + 1 }}
            </div>
            
            <!-- Instrucción -->
            <div class="flex-1 min-w-0">
              <p class="text-sm text-[#1f2937] mb-1">
                {{ segment.instruction }}
              </p>
              <div class="flex items-center gap-3 text-xs text-[#6b7280]">
                <span> {{ formatDistance(segment.distance) }}</span>
                <span> {{ formatDuration(segment.duration) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Información adicional -->
    <div class="text-xs text-[#6b7280] px-2">
      <p>
        La ruta se calculó {{ formatCalculatedAt() }}
      </p>
    </div>
  </div>

  <!-- Mensaje si no hay ruta -->
  <div v-else class="text-center py-8">
    <p class="text-sm text-[#6b7280]">
      No hay ruta calculada
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Route } from '@/modules/map/interfaces/routing.interfaces';

// ============================================
// PROPS
// ============================================

interface Props {
  /** La ruta a mostrar */
  route: Route | null;
  
  /** Mostrar toggle de instrucciones */
  showInstructionsToggle?: boolean;
  
  /** Instrucciones expandidas por defecto */
  defaultExpanded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showInstructionsToggle: true,
  defaultExpanded: false,
});

// ============================================
// STATE
// ============================================

const instructionsExpanded = ref(props.defaultExpanded);

// ============================================
// COMPUTED
// ============================================

/**
 * formattedDistance: Distancia formateada
 */
const formattedDistance = computed(() => {
  if (!props.route) return '';
  
  const meters = props.route.distance;
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
});

/**
 * formattedDuration: Duración formateada
 */
const formattedDuration = computed(() => {
  if (!props.route) return '';
  
  const seconds = props.route.duration;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes} min`;
});

// ============================================
// METHODS
// ============================================

/**
 * toggleInstructions: Toggle del estado de instrucciones
 */
const toggleInstructions = () => {
  instructionsExpanded.value = !instructionsExpanded.value;
};

/**
 * getTravelModeText: Retorna el texto del modo de transporte
 */
const getTravelModeText = (): string => {
  if (!props.route) return '';
  
  const modeTexts = {
    driving: 'En coche',
    cycling: 'En bicicleta',
    walking: 'A pie',
  };
  
  return modeTexts[props.route.travelMode] || '';
};

/**
 * formatDistance: Formatea una distancia en metros
 */
const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
};

/**
 * formatDuration: Formatea una duración en segundos
 */
const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)} seg`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * formatCalculatedAt: Formatea la fecha de cálculo
 */
const formatCalculatedAt = (): string => {
  if (!props.route) return '';
  
  const date = new Date(props.route.calculatedAt);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
  
  if (diffMinutes < 1) {
    return 'hace un momento';
  } else if (diffMinutes < 60) {
    return `hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
  } else {
    const hours = Math.floor(diffMinutes / 60);
    return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  }
};
</script>

<style scoped>
/* Animación suave para el despliegue de instrucciones */
.max-h-64 {
  scrollbar-width: thin;
  scrollbar-color: #42b983 #f3f4f6;
}

.max-h-64::-webkit-scrollbar {
  width: 6px;
}

.max-h-64::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.max-h-64::-webkit-scrollbar-thumb {
  background: #42b983;
  border-radius: 3px;
}

.max-h-64::-webkit-scrollbar-thumb:hover {
  background: #35a372;
}
</style>
