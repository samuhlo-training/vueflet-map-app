/**
 * LOCATION ERROR - COMPONENTE DE ERROR DE UBICACIÓN
 * 
 * Componente que se muestra cuando no se puede obtener la ubicación del usuario
 * - Mensaje de error personalizado
 * - Botón para reintentar obtener la ubicación
 * - Diseño consistente con la aplicación
 */

<template>
  <div class="flex items-center justify-center w-full h-full bg-[#f9fafb]">
    <div class="max-w-md mx-4 p-6 bg-white rounded-lg border border-[#e5e7eb] shadow-sm">
      <!-- Icono de error -->
      <div class="mb-4 text-center">
        <svg
          class="w-16 h-16 mx-auto text-[#ef4444]"
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
        No se pudo obtener tu ubicación
      </h2>

      <!-- Mensaje descriptivo -->
      <p class="text-[#6b7280] text-sm text-center mb-4">
        Para usar esta aplicación necesitamos acceder a tu ubicación.
        Por favor, verifica los permisos de tu navegador y vuelve a intentarlo.
      </p>

      <!-- Botón de reintentar -->
      <button
        @click="$emit('retry')"
        class="w-full px-4 py-2.5 text-sm font-medium text-white rounded transition-all duration-200 bg-[#4DB487] hover:bg-[#35a372] hover:shadow-lg cursor-pointer"
      >
        Volver a intentar
      </button>

      <!-- Información adicional -->
      <div class="mt-4 p-3 bg-[#f0fdf4] rounded-lg border border-[#d1fae5]">
        <p class="text-xs font-semibold text-[#1f2937] mb-2">
          💡 Consejos:
        </p>
        <ul class="text-xs text-[#6b7280] space-y-1">
          <li>• Asegúrate de permitir el acceso a la ubicación en tu navegador</li>
          <li>• Verifica que los servicios de ubicación estén activados</li>
          <li>• Recarga la página si el problema persiste</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Definir los eventos que emite el componente
defineEmits<{
  retry: []
}>()
</script>
