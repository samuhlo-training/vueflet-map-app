/**
 * DIRECTIONS INPUT
 * 
 * Input reutilizable para origen, destino y waypoints intermedios.
 * 
 * Características:
 * - Autocompletado de lugares (reutiliza el sistema de búsqueda)
 * - Botón "Mi ubicación" (solo para origen)
 * - Botón eliminar (solo para waypoints intermedios)
 * - Diferentes estilos según el tipo (origen/destino/waypoint)
 */

<template>
  <div class="relative">
    <!-- Indicador de tipo (círculo de color) -->
    <div class="flex items-start gap-2">
      <!-- Icono según tipo -->
      <div class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs mt-2" 
           :class="getIconClasses()">
        {{ getIcon() }}
      </div>

      <!-- Input y resultados -->
      <div class="flex-1">
        <!-- Input principal -->
        <div class="relative">
          <input
            ref="inputRef"
            v-model="searchQuery"
            type="text"
            :placeholder="placeholder"
            @input="handleInput"
            @focus="handleFocus"
            @blur="handleBlur"
            class="w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2"
            :class="getInputClasses()"
          />

          <!-- Botones dentro del input (derecha) -->
          <div class="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <!-- Botón "Mi ubicación" - solo para origen -->
            <button
              v-if="type === 'origin' && showMyLocationButton"
              @click="handleMyLocation"
              type="button"
              class="p-1 text-xs text-[#4DB487] hover:bg-[#f0fdf4] rounded transition-all duration-200"
              title="Usar mi ubicación"
            >
              📍
            </button>

            <!-- Botón eliminar - solo para waypoints intermedios -->
            <button
              v-if="type === 'waypoint' && showRemoveButton"
              @click="handleRemove"
              type="button"
              class="p-1 text-xs text-[#ef4444] hover:bg-[#fee2e2] rounded transition-all duration-200"
              title="Eliminar parada"
            >
              ✕
            </button>

            <!-- Botón limpiar - si hay texto -->
            <button
              v-if="searchQuery"
              @click="handleClear"
              type="button"
              class="p-1 text-xs text-[#6b7280] hover:bg-[#f3f4f6] rounded transition-all duration-200"
              title="Limpiar"
            >
              ⌫
            </button>
          </div>
        </div>

        <!-- Resultados de autocompletado -->
        <div
          v-if="showResults && filteredResults.length > 0"
          class="absolute z-50 w-full mt-1 bg-white border border-[#e5e7eb] rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          <button
            v-for="place in filteredResults"
            :key="place.id"
            @click="handleSelectPlace(place)"
            type="button"
            class="w-full text-left px-3 py-2 hover:bg-[#f0fdf4] transition-all duration-200 border-b border-[#f3f4f6] last:border-b-0"
          >
            <p class="text-sm font-medium text-[#1f2937] truncate">
              {{ place.name }}
            </p>
            <p class="text-xs text-[#6b7280] truncate">
              {{ place.display_name }}
            </p>
          </button>
        </div>

        <!-- Mensaje cuando está buscando -->
        <div
          v-if="showResults && isSearching"
          class="absolute z-50 w-full mt-1 bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 text-center"
        >
          <p class="text-xs text-[#6b7280]">⏳ Buscando...</p>
        </div>

        <!-- Mensaje cuando no hay resultados -->
        <div
          v-if="showResults && !isSearching && searchQuery && filteredResults.length === 0"
          class="absolute z-50 w-full mt-1 bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 text-center"
        >
          <p class="text-xs text-[#6b7280]">No se encontraron lugares</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { usePlacesStore } from '@/modules/map/stores/places.store';
import type { Place } from '@/modules/map/interfaces/place.interfaces';
import type { WaypointType } from '@/modules/map/interfaces/routing.interfaces';

// ============================================
// PROPS
// ============================================

interface Props {
  /** Valor actual del input (nombre del lugar) */
  modelValue: string;
  
  /** Tipo de waypoint: origin, destination, waypoint */
  type: WaypointType;
  
  /** Placeholder del input */
  placeholder?: string;
  
  /** Mostrar botón "Mi ubicación" */
  showMyLocationButton?: boolean;
  
  /** Mostrar botón eliminar */
  showRemoveButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Buscar lugar...',
  showMyLocationButton: true,
  showRemoveButton: true,
});

// ============================================
// EMITS
// ============================================

interface Emits {
  /** Se emite cuando el input cambia */
  (e: 'update:modelValue', value: string): void;
  
  /** Se emite cuando se selecciona un lugar del autocompletado */
  (e: 'place-selected', place: Place): void;
  
  /** Se emite cuando se hace click en "Mi ubicación" */
  (e: 'my-location'): void;
  
  /** Se emite cuando se hace click en "Eliminar" */
  (e: 'remove'): void;
}

const emit = defineEmits<Emits>();

// ============================================
// STATE
// ============================================

const placesStore = usePlacesStore();
const inputRef = ref<HTMLInputElement | null>(null);
const searchQuery = ref(props.modelValue);
const showResults = ref(false);
const isSearching = ref(false);

// Debounce timer para no hacer demasiadas búsquedas
let searchTimer: ReturnType<typeof setTimeout> | null = null;

// ============================================
// COMPUTED
// ============================================

/**
 * filteredResults: Resultados de búsqueda filtrados
 */
const filteredResults = computed(() => {
  return placesStore.searchResults.slice(0, 5); // Máximo 5 resultados
});

// ============================================
// WATCHERS
// ============================================

/**
 * Watch del modelValue para sincronizar con searchQuery
 */
watch(() => props.modelValue, (newValue) => {
  searchQuery.value = newValue;
});

// ============================================
// METHODS
// ============================================

/**
 * handleInput: Maneja el input del usuario
 */
const handleInput = () => {
  emit('update:modelValue', searchQuery.value);
  
  // Limpiar timer anterior
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  
  // Si el input está vacío, no buscar
  if (!searchQuery.value.trim()) {
    showResults.value = false;
    return;
  }
  
  // Buscar después de 300ms (debounce)
  isSearching.value = true;
  showResults.value = true;
  
  searchTimer = setTimeout(async () => {
    await placesStore.searchPlaces(searchQuery.value);
    isSearching.value = false;
  }, 300);
};

/**
 * handleFocus: Maneja el focus del input
 */
const handleFocus = () => {
  if (searchQuery.value && filteredResults.value.length > 0) {
    showResults.value = true;
  }
};

/**
 * handleBlur: Maneja el blur del input
 * Usamos setTimeout para dar tiempo al click en un resultado
 */
const handleBlur = () => {
  setTimeout(() => {
    showResults.value = false;
  }, 200);
};

/**
 * handleSelectPlace: Maneja la selección de un lugar
 */
const handleSelectPlace = (place: Place) => {
  searchQuery.value = place.name;
  emit('update:modelValue', place.name);
  emit('place-selected', place);
  showResults.value = false;
};

/**
 * handleMyLocation: Maneja el click en "Mi ubicación"
 */
const handleMyLocation = () => {
  emit('my-location');
  showResults.value = false;
};

/**
 * handleRemove: Maneja el click en "Eliminar"
 */
const handleRemove = () => {
  emit('remove');
};

/**
 * handleClear: Limpia el input
 */
const handleClear = () => {
  searchQuery.value = '';
  emit('update:modelValue', '');
  showResults.value = false;
  inputRef.value?.focus();
};

/**
 * getIcon: Retorna el icono según el tipo
 */
const getIcon = (): string => {
  switch (props.type) {
    case 'origin':
      return 'A';
    case 'destination':
      return 'B';
    case 'waypoint':
      return '•';
    default:
      return '•';
  }
};

/**
 * getIconClasses: Retorna las clases del icono según el tipo
 */
const getIconClasses = (): string => {
  switch (props.type) {
    case 'origin':
      return 'bg-[#4DB487] text-white font-bold';
    case 'destination':
      return 'bg-[#ef4444] text-white font-bold';
    case 'waypoint':
      return 'bg-[#6b7280] text-white font-bold';
    default:
      return 'bg-[#6b7280] text-white';
  }
};

/**
 * getInputClasses: Retorna las clases del input según el tipo
 */
const getInputClasses = (): string => {
  const baseClasses = 'border-[#e5e7eb]';
  
  switch (props.type) {
    case 'origin':
      return `${baseClasses} focus:border-[#4DB487] focus:ring-[#4DB487]/20`;
    case 'destination':
      return `${baseClasses} focus:border-[#ef4444] focus:ring-[#ef4444]/20`;
    case 'waypoint':
      return `${baseClasses} focus:border-[#6b7280] focus:ring-[#6b7280]/20`;
    default:
      return baseClasses;
  }
};
</script>
