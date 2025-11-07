<template>
  <l-marker :lat-lng="location">
    <l-popup :options="popupOptions">
      <div class="p-2 font-inherit">
        <!-- Encabezado -->
        <div class="flex justify-between items-center flex-col mb-2 gap-1 border-b-2 border-gray-200 pb-2">
          <h4 class="font-bold text-base">{{ title }}</h4>
          <span v-if="badge" class="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">{{ badge }}</span>
        </div>

        <!-- Contenido personalizado -->
        <slot />

        <!-- Información de ubicación por defecto -->
        <div v-if="showCoordinates" class="mt-2 pt-2 border-t border-gray-100 text-center">
          <p class="text-xs text-gray-500">
            📍 {{ location[0].toFixed(4) }}, {{ location[1].toFixed(4) }}
          </p>
          <p class="text-xs text-gray-400">{{ timestamp }}</p>
        </div>

      
      </div>
    </l-popup>
  </l-marker>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LMarker, LPopup } from '@vue-leaflet/vue-leaflet'

interface Props {
  location: [number, number]
  title: string
  badge?: string
  showCoordinates?: boolean

  maxWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  showCoordinates: true,
  showActions: false,
  maxWidth: 300
})



// Formatea la hora actual
const timestamp = computed(() => {
  const date = new Date()
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

// Opciones del popup
const popupOptions = computed(() => ({
  maxWidth: props.maxWidth,
  className: 'custom-popup',
  closeButton: true,
  autoClose: false,
  closeOnClick: false
}))
</script>


