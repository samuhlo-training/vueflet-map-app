<template>
    <h1 class="text-3xl font-bold mb-4">MapView</h1>
        <!-- Mostrar información de carga -->
   <ScreenLoader v-if="isLoading" msg="Obteniendo ubicación..." />

    <!-- Mostrar ubicación cuando esté lista -->
    <div v-else-if="userLocation" class="h-screen w-screen flex justify-center items-center">
      <Map :userLocation="userLocation" />
    </div>

    <div v-else>
      <p>No se pudo obtener la ubicación</p>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMapStore } from '@/modules/map/stores/map.store'
import ScreenLoader from '@/modules/common/components/ScreenLoader.vue'
import Map from '@/modules/map/components/Map.vue'



const mapStore = useMapStore()

// Extraer los estados (variables reactivas) directamente del store
const { isLoading, userLocation } = storeToRefs(mapStore)


const { getCurrentPosition } = mapStore

// Montar primero el componente y luego obtener la ubicación
onMounted(async () => {
  try {
    const location = await getCurrentPosition()
    console.log('Ubicación obtenida:', location)
  } catch (error) {
    console.error('Error al obtener ubicación:', error)
  }
})
</script>