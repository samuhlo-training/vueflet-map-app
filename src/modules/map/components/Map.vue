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
        <MarkerPopup
          v-for="place in searchResults"
          :key="place.id"
          :location="place.coordinates"
          :title="place.name"
          badge="Búsqueda"
          :icon-type="place.id === activePlaceId ? 'active' : 'default'"
        />
      </l-map>
</template>

<script setup lang="ts">

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import MarkerPopup from "./MarkerPopup.vue";
import { useMapStore } from "../stores/map.store";
import { usePlacesStore } from "../stores/places.store";
import {  ref, computed} from "vue";

// 🔧 Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const mapStore = useMapStore();
const placesStore = usePlacesStore();
const mapRef = ref<InstanceType<typeof LMap> | null>(null);

const searchResults = computed(() => placesStore.searchResults);
const activePlaceId = computed(() => placesStore.activePlaceId);

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


defineProps<{
  userLocation: [number, number]
}>()
</script>