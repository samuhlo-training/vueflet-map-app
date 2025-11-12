/**
 * MAP VIEW - VISTA PRINCIPAL DEL MAPA
 * 
 * Vista principal de la aplicación de mapas con:
 * - Gestión de la ubicación del usuario
 * - Pantalla de carga mientras se obtiene la ubicación
 * - Integración con el componente Map
 * - Controles de búsqueda y ubicación
 */

<template>
  <div class="w-full h-full">
    <!-- Mostrar información de carga -->
    <ScreenLoader v-if="isLoading" msg="Obteniendo ubicación..." />

    <!-- Mostrar ubicación cuando esté lista -->
    <Map v-else-if="userLocation" :userLocation="userLocation" class="w-full h-full" />
   
    <!-- Mostrar error si no se puede obtener la ubicación -->
    <LocationError v-else @retry="handleRetry" />

      <!-- Zona Botones Derecha-->
     <div class="absolute top-3 right-4 z-999">
       <MyLocationButton />
     </div>
      <!-- Zona Barra de Búsqueda Izquierda-->
      <div class="absolute top-3 left-4">
        <SearchBar />
      </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlacesStore } from '@/modules/map/stores/places.store'
import ScreenLoader from '@/modules/common/components/ScreenLoader.vue'
import LocationError from '@/modules/common/components/LocationError.vue'
import Map from '@/modules/map/components/Map.vue'
import MyLocationButton from '@/modules/map-controls/components/directions-panel/MyLocationButton.vue'
import SearchBar from '@/modules/map-controls/components/search-panel/SearchBar.vue'



const placesStore = usePlacesStore()

// Extraer los estados (variables reactivas) directamente del store
const { isLoading, userLocation } = storeToRefs(placesStore)


const { getCurrentPosition } = placesStore

// Función para intentar obtener la ubicación
const handleRetry = async () => {
  try {
    const location = await getCurrentPosition()
    console.log('Ubicación obtenida:', location)
  } catch (error) {
    console.error('Error al obtener ubicación:', error)
  }
}

// Montar primero el componente y luego obtener la ubicación
onMounted(async () => {
  await handleRetry()
})
</script>