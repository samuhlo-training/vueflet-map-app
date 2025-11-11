/**
 * TRAVEL MODE SELECTOR
 * 
 * Componente para seleccionar el modo de transporte:
 * - 🚗 Coche (driving)
 * - 🚴 Bicicleta (cycling)
 * - 🚶 A pie (walking)
 * 
 * Es un componente controlado: recibe el valor actual como prop
 * y emite eventos cuando el usuario cambia la selección.
 */

<template>
  <div class="space-y-2">
    <!-- Label opcional -->
    <label v-if="showLabel" class="block text-xs font-medium text-[#6b7280]">
      Modo de transporte
    </label>

    <!-- Botones de selección -->
    <div class="flex gap-2">
      <button
        v-for="mode in modes"
        :key="mode.value"
        @click="handleSelect(mode.value)"
        type="button"
        class="flex-1 py-2 px-3 text-xs rounded-lg transition-all duration-200 flex items-center justify-center gap-1"
        :class="getButtonClasses(mode.value)"
        :title="mode.description"
      >
        
        <span class="font-medium">{{ mode.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TravelMode } from '@/modules/map/interfaces/routing.interfaces';

// ============================================
// PROPS
// ============================================

/**
 * Props del componente
 * 
 * modelValue: El modo de transporte actualmente seleccionado
 * showLabel: Si se muestra el label "Modo de transporte"
 */
interface Props {
  modelValue: TravelMode;
  showLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true,
});

// ============================================
// EMITS
// ============================================

/**
 * Eventos que emite el componente
 * 
 * update:modelValue: Se emite cuando el usuario selecciona un modo
 */
interface Emits {
  (e: 'update:modelValue', value: TravelMode): void;
}

const emit = defineEmits<Emits>();

// ============================================
// DATA
// ============================================

/**
 * Configuración de los modos de transporte disponibles
 */
const modes = [
  {
    value: 'driving' as TravelMode,
    label: 'Coche',

    description: 'Ruta en coche por carretera',
  },
  {
    value: 'cycling' as TravelMode,
    label: 'Bici',

    description: 'Ruta en bicicleta por carriles y calles',
  },
  {
    value: 'walking' as TravelMode,
    label: 'Pie',
    description: 'Ruta a pie por aceras y senderos',
  },
];

// ============================================
// METHODS
// ============================================

/**
 * handleSelect: Maneja la selección de un modo
 * 
 * @param mode - El modo seleccionado
 */
const handleSelect = (mode: TravelMode) => {
  // Solo emitir si el modo es diferente al actual
  if (mode !== props.modelValue) {
    emit('update:modelValue', mode);
  }
};

/**
 * getButtonClasses: Retorna las clases CSS para un botón
 * 
 * @param mode - El modo del botón
 * @returns String con las clases CSS
 */
const getButtonClasses = (mode: TravelMode): string => {
  const isActive = mode === props.modelValue;
  
  if (isActive) {
    return 'bg-[#4DB487] text-white shadow-md transform scale-105';
  }
  
  return 'bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#1f2937] cursor-pointer';
};
</script>

<style scoped>
/* Animación suave para el botón activo */
button {
  transition: all 0.2s ease-in-out;
}

button:active {
  transform: scale(0.98);
}
</style>
