<template>
  <div class="w-full h-full">
    <!-- Mostrar información de carga -->
    <ScreenLoader v-if="isLoading" msg="Obteniendo ubicación..." />

    <!-- Mostrar ubicación cuando esté lista -->
    <Map v-else-if="userLocation" :userLocation="userLocation" class="w-full h-full" />
   
       <div v-else>
      <p>No se pudo obtener la ubicación</p>
    </div>

      <!-- Zona Botones Derecha-->
     <div class="absolute top-4 right-10">
       <MyLocationButton />
     </div>
      <!-- Zona Barra de Búsqueda Izquierda-->
      <div class="absolute top-4 left-10">
        <SearchBar />
      </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlacesStore } from '@/modules/map/stores/places.store'
import ScreenLoader from '@/modules/common/components/ScreenLoader.vue'
import Map from '@/modules/map/components/Map.vue'
import MyLocationButton from '@/modules/map-controls/components/MyLocationButton.vue'
import SearchBar from '@/modules/map-controls/components/SearchBar.vue'



const placesStore = usePlacesStore()

// Extraer los estados (variables reactivas) directamente del store
const { isLoading, userLocation } = storeToRefs(placesStore)


const { getCurrentPosition } = placesStore

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