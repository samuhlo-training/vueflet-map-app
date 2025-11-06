<template>
    <h1 class="text-3xl font-bold mb-4">MapView</h1>
        <!-- Mostrar información de carga -->
    <div v-if="isLoading">
      <p>Cargando ubicación...</p>
    </div>

    <!-- Mostrar ubicación cuando esté lista -->
    <div v-else-if="userLocation">
      <p class="text-2xl">Tu ubicación actual:</p>
      <p class="font-bold">Latitud: {{ userLocation[0] }}</p>
      <p class="font-bold">Longitud: {{ userLocation[1] }}</p>
    </div>

    <div v-else>
      <p>No se pudo obtener la ubicación</p>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMapStore } from '@/modules/map/stores/map.store'


// 1. Obtener el store
const mapStore = useMapStore()

// 2. Extraer las propiedades REACTIVAS del store (estado y getters)
const { isLoading, userLocation, isUserLocationReady } = storeToRefs(mapStore)

// 3. Extraer las acciones (funciones) directamente del store
const { getCurrentPosition } = mapStore

// 4. Cuando el componente se monte, obtener la ubicación
onMounted(async () => {
  try {
    const location = await getCurrentPosition()
    console.log('Ubicación obtenida:', location)
  } catch (error) {
    console.error('Error al obtener ubicación:', error)
  }
})
</script>