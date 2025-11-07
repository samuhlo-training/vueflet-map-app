<template>
    <button @click="centerMapOnUserLocation" class="bg-green-600 text-white font-bold p-2 rounded shadow cursor-pointer hover:bg-gray-800 transition">
        Mi Ubicación
    </button>
</template>

<script setup lang="ts">
import { useMapStore } from "../stores/map.store";
import { usePlacesStore } from "../stores/places.store";

const mapStore = useMapStore();
const placesStore = usePlacesStore();

const centerMapOnUserLocation = () => {
    const userLocation = placesStore.userLocation;
    if (userLocation) {
        mapStore.setCenter(userLocation[0], userLocation[1]);
    }
};
</script>