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
        
        <MarkerPopup :location="userLocation" title="Mi Ubicacion" badge="Actual" />
      </l-map>
</template>

<script setup lang="ts">

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import MarkerPopup from "./MarkerPopup.vue";
import { useMapStore } from "../stores/map.store";
import {  ref} from "vue";

// 🔧 Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const mapStore = useMapStore();
const mapRef = ref<InstanceType<typeof LMap> | null>(null);

const onMapReady = () => {
  if (mapRef.value?.leafletObject) {
    console.log('Map instance found:', mapRef.value.leafletObject);
    mapStore.setMap(mapRef.value.leafletObject as L.Map);
  } else {
    console.warn('Map instance not found', mapRef.value);
  }
};


defineProps<{
  userLocation: [number, number]
}>()
</script>