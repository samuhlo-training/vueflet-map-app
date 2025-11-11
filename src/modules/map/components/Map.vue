<template>
   <l-map
        ref="mapRef"
        :center="userLocation"
        :zoom="25"
        class="w-full h-full"
        @ready="onMapReady"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
        />

        <MarkerPopup :location="userLocation" title="Mi Ubicacion" badge="Actual" timestamp icon-type="user" />

        <!-- Markers para resultados de búsqueda -->
        <!-- En modo búsqueda: muestra todos -->
        <!-- En modo direcciones: muestra solo el activo (destino seleccionado) -->
        <MarkerPopup
          v-for="place in visibleSearchResults"
          :key="place.id"
          :location="place.coordinates"
          :title="place.name"
          badge="Búsqueda"
          :icon-type="place.id === activePlaceId ? 'active' : 'default'"
        />

        <!-- Markers para waypoints de direcciones (solo en modo direcciones) -->
        <template v-if="isDirectionsMode">
          <!-- Marcador de origen -->
          <MarkerPopup
            v-if="originWaypoint"
            :key="`origin-${originWaypoint.id}`"
            :location="originWaypoint.coordinates"
            :title="originWaypoint.name"
            badge="Origen"
            icon-type="origin"
          />

          <!-- Marcador de destino -->
          <MarkerPopup
            v-if="destinationWaypoint"
            :key="`destination-${destinationWaypoint.id}`"
            :location="destinationWaypoint.coordinates"
            :title="destinationWaypoint.name"
            badge="Destino"
            icon-type="destination"
          />

          <!-- TODAS LAS RUTAS: Se dibujan en orden con estilos según isSelected -->
          <!-- Primero las NO seleccionadas (grises, tenues) -->
          <!-- Luego la seleccionada (colorida, gruesa) -->
          
          <!-- Ruta principal (si NO está seleccionada) -->
          <LPolyline
            v-if="currentRoute && !currentRoute.isSelected"
            :lat-lngs="currentRoute.geometry"
            color="#374C61"
            :weight="7"
            :opacity="0.6"
            :dash-array="'10, 10'"
            @click="handleAlternativeClick(-1)"
            class="cursor-pointer hover:opacity-100 transition-opacity duration-200"
          />
          
          <!-- Rutas alternativas (si NO están seleccionadas) -->
          <template v-for="(altRoute, index) in alternativeRoutes" :key="`alt-route-${index}-unselected`">
            <LPolyline
              v-if="!altRoute.isSelected"
              :lat-lngs="altRoute.geometry"
              color="#374C61"
              :weight="7"
              :opacity="0.6"
              :dash-array="'10, 10'"
              @click="handleAlternativeClick(index)"
              class="cursor-pointer hover:opacity-100 transition-opacity duration-200"
            />
          </template>

          <!-- Ruta principal (si SÍ está seleccionada) -->
          <LPolyline
            v-if="currentRoute && currentRoute.isSelected !== false"
            :lat-lngs="currentRoute.geometry"
            :color="routeColor"
            :weight="7"
            :opacity="0.8"
          />
          
          <!-- Rutas alternativas (si SÍ están seleccionadas) -->
          <template v-for="(altRoute, index) in alternativeRoutes" :key="`alt-route-${index}-selected`">
            <LPolyline
              v-if="altRoute.isSelected"
              :lat-lngs="altRoute.geometry"
              :color="routeColor"
              :weight="7"
              :opacity="0.8"
            />
          </template>
        </template>
      </l-map>
</template>

<script setup lang="ts">

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LMap, LTileLayer, LPolyline } from "@vue-leaflet/vue-leaflet";
import MarkerPopup from "./MarkerPopup.vue";
import { useMapStore } from "../stores/map.store";
import { usePlacesStore } from "../stores/places.store";
import { useRoutingStore } from "../stores/routing.store";
import {  ref, computed, watch } from "vue";

// 🔧 Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const mapStore = useMapStore();
const placesStore = usePlacesStore();
const routingStore = useRoutingStore();
const mapRef = ref<InstanceType<typeof LMap> | null>(null);

const searchResults = computed(() => placesStore.searchResults);
const activePlaceId = computed(() => placesStore.activePlaceId);
const showSearchMarkers = computed(() => placesStore.showSearchMarkers);

// Waypoints de direcciones
const originWaypoint = computed(() => routingStore.originWaypoint);
const destinationWaypoint = computed(() => routingStore.destinationWaypoint);
const isDirectionsMode = computed(() => routingStore.isDirectionsMode);

// Ruta calculada
const currentRoute = computed(() => routingStore.currentRoute);
const alternativeRoutes = computed(() => routingStore.alternativeRoutes);

/**
 * routeColor: Color de la línea de ruta según el modo de transporte
 */
const routeColor = computed(() => {
  if (!currentRoute.value) return '#374C61'; // Default 
  
  const colors = {
    driving: '#374C61',  // Gris verde Vue
    cycling: '#F9CF30',  // Amarillo leaflet (Ucrania)
    walking: '#146CD7',  // Azul leaflet ( Ucrania)
  };
  
  return colors[currentRoute.value.travelMode];
});

/**
 * visibleSearchResults: Filtra los resultados de búsqueda según el modo
 * - Modo búsqueda: Muestra todos los resultados
 * - Modo direcciones: Muestra solo el marcador activo (destino seleccionado)
 */
const visibleSearchResults = computed(() => {
  if (!showSearchMarkers.value) {
    // En modo direcciones, solo mostrar el marcador activo (destino)
    if (activePlaceId.value !== null) {
      return searchResults.value.filter(place => place.id === activePlaceId.value);
    }
    return [];
  }
  // En modo búsqueda, mostrar todos
  return searchResults.value;
});

  // Manejar el evento de mapa listo para guardar la instancia del mapa en el store
const onMapReady = () => {
  if (mapRef.value?.leafletObject) {
    const map = mapRef.value.leafletObject as L.Map;
    // Remover los controles de zoom directamente con JS ( no funciona con las opciones de Vue-Leaflet)
    if (map.zoomControl) {
      map.removeControl(map.zoomControl);
    }
    mapStore.setMap(map);
  } else {
    console.warn('Map instance not found', mapRef.value);
  }
};

/**
 * fitRouteBounds: Ajusta el mapa para mostrar toda la ruta
 * 
 * Cuando se calcula una ruta, el mapa se ajusta automáticamente
 * para que puedas ver todo el recorrido de un vistazo.
 */
const fitRouteBounds = () => {
  if (!currentRoute.value || !mapRef.value?.leafletObject) return;
  
  const map = mapRef.value.leafletObject as L.Map;
  
  // Crear un "bounds" (rectángulo invisible) que contenga todas las coordenadas
  const bounds = L.latLngBounds(currentRoute.value.geometry);
  
  // Ajustar el mapa para que muestre todo el bounds con un poco de padding
  map.fitBounds(bounds, {
    padding: [50, 50], // 50 píxeles de margen en todos los lados
    maxZoom: 15,       // No hacer zoom demasiado cercano
    animate: true,     // Animar la transición
    duration: 1.0      // 1 segundo de animación
  });
  
  console.log('🗺️ Mapa ajustado para mostrar la ruta completa');
};

/**
 * handleAlternativeClick: Maneja el click en una ruta alternativa
 * 
 * Cuando haces click en una ruta alternativa gris, esta se convierte
 * en la ruta principal y la anterior pasa a ser alternativa.
 */
const handleAlternativeClick = (index: number) => {
  console.log('🔄 Cambiando a ruta alternativa', index);
  routingStore.selectAlternativeRoute(index);
  
  // Opcional: ajustar el mapa a la nueva ruta
  setTimeout(() => {
    fitRouteBounds();
  }, 100);
};

/**
 * Watch: Cuando se calcule una ruta, ajustar el mapa automáticamente
 */
watch(currentRoute, (newRoute) => {
  if (newRoute) {
    // Esperar un poquito para que la polyline se renderice
    setTimeout(() => {
      fitRouteBounds();
    }, 100);
  }
});


defineProps<{
  userLocation: [number, number]
}>()
</script>