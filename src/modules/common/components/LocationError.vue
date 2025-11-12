/**
 * LOCATION ERROR - COMPONENTE DE ERROR DE UBICACIÓN
 * 
 * Componente que se muestra cuando no se puede obtener la ubicación del usuario
 * - Mensaje de error personalizado según el tipo de error
 * - Botón para reintentar obtener la ubicación
 * - Instrucciones específicas para permisos denegados
 * - Diseño consistente con la aplicación
 */

<template>
  <div class="flex items-center justify-center w-full h-full bg-[#f9fafb]">
    <div class="max-w-md mx-4 p-6 bg-white rounded-lg border border-[#e5e7eb] shadow-sm">
      <!-- Icono de error -->
      <div class="mb-4 text-center">
        <svg
          class="w-16 h-16 mx-auto"
          :class="isPermissionDenied ? 'text-[#f59e0b]' : 'text-[#ef4444]'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>

      <!-- Título -->
      <h2 class="text-lg font-semibold text-[#1f2937] text-center mb-2">
        {{ errorTitle }}
      </h2>

      <!-- Mensaje descriptivo -->
      <p class="text-[#6b7280] text-sm text-center mb-4">
        {{ errorMessage }}
      </p>

      <!-- Botón de reintentar (solo si no es permiso denegado permanentemente) -->
      <button
        v-if="!isPermissionDenied"
        @click="$emit('retry')"
        class="w-full px-4 py-2.5 text-sm font-medium text-white rounded transition-all duration-200 bg-[#4DB487] hover:bg-[#35a372] hover:shadow-lg cursor-pointer"
      >
        Volver a intentar
      </button>

      <!-- Información adicional -->
      <div class="mt-4 p-3 rounded-lg border"
           :class="isPermissionDenied ? 'bg-[#fef3c7] border-[#fde68a]' : 'bg-[#f0fdf4] border-[#d1fae5]'">
        <p class="text-xs font-semibold text-[#1f2937] mb-2">
          {{ isPermissionDenied ? '🔒 Permiso denegado:' : '💡 Consejos:' }}
        </p>
        <ul class="text-xs text-[#6b7280] space-y-1">
          <li v-if="isPermissionDenied">• Haz clic en el icono 🔒 o ⓘ en la barra de direcciones del navegador</li>
          <li v-if="isPermissionDenied">• Busca "Permisos" o "Ubicación" en la configuración del sitio</li>
          <li v-if="isPermissionDenied">• Cambia el permiso de "Bloqueado" a "Permitir"</li>
          <li v-if="isPermissionDenied">• Recarga la página después de cambiar el permiso</li>
          <template v-else>
            <li>• Asegúrate de permitir el acceso a la ubicación en tu navegador</li>
            <li>• Verifica que los servicios de ubicación estén activados</li>
            <li>• Recarga la página si el problema persiste</li>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
const props = defineProps<{
  errorCode?: number | null
}>()

// Definir los eventos que emite el componente
defineEmits<{
  retry: []
}>()

// Códigos de error de Geolocation API:
// 1 = PERMISSION_DENIED
// 2 = POSITION_UNAVAILABLE
// 3 = TIMEOUT

const isPermissionDenied = computed(() => props.errorCode === 1)

const errorTitle = computed(() => {
  switch (props.errorCode) {
    case 1:
      return 'Permiso de ubicación denegado'
    case 2:
      return 'Ubicación no disponible'
    case 3:
      return 'Tiempo de espera agotado'
    default:
      return 'No se pudo obtener tu ubicación'
  }
})

const errorMessage = computed(() => {
  switch (props.errorCode) {
    case 1:
      return 'Has bloqueado el acceso a tu ubicación. Para usar esta aplicación necesitas cambiar los permisos manualmente en tu navegador.'
    case 2:
      return 'No se pudo determinar tu ubicación. Verifica que tus servicios de ubicación estén activados.'
    case 3:
      return 'La solicitud de ubicación tardó demasiado tiempo. Por favor, inténtalo de nuevo.'
    default:
      return 'Para usar esta aplicación necesitamos acceder a tu ubicación. Por favor, verifica los permisos de tu navegador.'
  }
})
</script>
