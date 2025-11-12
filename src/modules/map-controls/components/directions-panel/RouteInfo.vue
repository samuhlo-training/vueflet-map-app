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
    <div class="bg-green-light border border-primary rounded-lg p-4">
      <h4 class="text-xs font-medium text-gray-medium mb-3">
        Ruta calculada
      </h4>
      
      <div class="grid grid-cols-2 gap-3">
        <!-- Distancia -->
        <div class="flex items-center gap-2">
          <span class="text-xl"></span>
          <div>
            <p class="text-xs text-gray-medium">Distancia</p>
            <p class="text-lg font-bold text-gray-dark">{{ formattedDistance }}</p>
          </div>
        </div>
        
        <!-- Duración -->
        <div class="flex items-center gap-2">
          <span class="text-xl"></span>
          <div>
            <p class="text-xs text-gray-medium">Tiempo</p>
            <p class="text-lg font-bold text-gray-dark">{{ formattedDuration }}</p>
          </div>
        </div>
      </div>

      <!-- Modo de transporte -->
      <div class="mt-3 pt-3 border-t border-green-border">
        <p class="text-xs text-gray-medium">
          {{ travelModeText }}
        </p>
      </div>
    </div>

    <!-- Botón para ver instrucciones -->
    <button
      v-if="showInstructionsToggle"
      @click="toggleInstructions"
      type="button"
      class="w-full py-2 px-3 text-sm font-medium text-primary bg-white border border-primary rounded-lg hover:bg-green-light transition-all duration-200 flex items-center justify-between cursor-pointer"
    >
      <span>{{ instructionsExpanded ? 'Ocultar' : 'Ver' }} instrucciones</span>
      <span class="transform transition-transform duration-200" :class="{ 'rotate-180': instructionsExpanded }">
        ▼
      </span>
    </button>

    <!-- Instrucciones detalladas (plegable) -->
    <div
      v-if="instructionsExpanded && route.segments.length > 0"
      class="bg-white border border-gray-light rounded-lg overflow-hidden"
    >
      <div class="max-h-64 overflow-y-auto">
        <div
          v-for="(segment, index) in route.segments"
          :key="`${route.id}-segment-${index}`"
          class="px-4 py-3 border-b border-gray-border last:border-b-0 hover:bg-gray-ultra-light transition-all duration-200"
        >
          <div class="flex items-start gap-3">
            <!-- Número del paso -->
            <div class="shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center mt-0.5">
              {{ index + 1 }}
            </div>
            
            <!-- Instrucción -->
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-dark mb-1">
                {{ segment.instruction }}
              </p>
              <div class="flex items-center gap-3 text-xs text-gray-medium">
                <span> {{ formatDistance(segment.distance) }}</span>
                <span> {{ formatDuration(segment.duration) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Información adicional -->
    <div class="text-xs text-gray-medium px-2">
      <p>
        La ruta se calculó {{ calculatedAtText }}
      </p>
    </div>
  </div>

  <!-- Mensaje si no hay ruta -->
  <div v-else class="text-center py-8">
    <p class="text-sm text-gray-medium">
      No hay ruta calculada
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef, watch} from 'vue';
import type { Route } from '@/modules/map/interfaces/routing.interfaces';
import { useFormattedRoute } from '../../composables/useFormattedRoute';

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
// WATCHERS
// ============================================

/**
 * Cerrar las instrucciones cuando cambie la ruta
 * Esto fuerza a que el usuario vea el resumen de la nueva ruta
 * y luego pueda expandir las instrucciones actualizadas
 */
watch(
  () => props.route,
  (newRoute, oldRoute) => {
    // Si cambió la ruta completa (diferente ID o diferente objeto)
    if (newRoute?.id !== oldRoute?.id && instructionsExpanded.value) {
      instructionsExpanded.value = false;
    }
  },
  { deep: false } // No necesitamos deep watch, solo detectar cambio de referencia
);

// ============================================
// COMPUTED
// ============================================

// FORMATTERS - COMPOSABLE

const {
  formattedDistance,
  formattedDuration,
  travelModeText,
  calculatedAtText,
  formatDistance,
  formatDuration,
} = useFormattedRoute(toRef(props, 'route'));



// ============================================
// METHODS
// ============================================

/**
 * toggleInstructions: Toggle del estado de instrucciones
 */
const toggleInstructions = () => {
  instructionsExpanded.value = !instructionsExpanded.value;
};




</script>

<style scoped>
/* Animación suave para el despliegue de instrucciones */
.max-h-64 {
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary) var(--color-gray-border);
}

.max-h-64::-webkit-scrollbar {
  width: 6px;
}

.max-h-64::-webkit-scrollbar-track {
  background: var(--color-gray-border);
}

.max-h-64::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 3px;
}

.max-h-64::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary-hover);
}
</style>
