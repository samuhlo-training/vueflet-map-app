<template>
    <button @click="centerMapOnUserLocation" class="cursor-pointer px-3 py-1.5 text-md font-medium text-white bg-[#42b983] rounded hover:shadow-lg hover:bg-[#2d3d4d] transition-all duration-200">
        Mi Ubicación
    </button>
</template>

<script setup lang="ts">
import { useMapStore } from "../../map/stores/map.store";
import { usePlacesStore } from "../../map/stores/places.store";

const mapStore = useMapStore();
const placesStore = usePlacesStore();

const centerMapOnUserLocation = () => {
    const userLocation = placesStore.userLocation;
    if (userLocation) {
        mapStore.setCenterWithAnimation(userLocation[0], userLocation[1], 18);
    }
};
</script>