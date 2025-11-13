<template>
    <button @click="centerMapOnUserLocation"  class=" px-3 pt-1.5 text-md font-medium text-white bg-primary rounded hover:shadow-lg hover:bg-gray-darker transition-all duration-200 cursor-pointer z-999">
        <i class="material-icons">my_location</i>
    </button>
</template>

<script setup lang="ts">
import { useMapStore } from "../../../map/stores/map.store";
import { usePlacesStore } from "../../../map/stores/places.store";

const mapStore = useMapStore();
const placesStore = usePlacesStore();

const centerMapOnUserLocation = () => {
    const userLocation = placesStore.userLocation;
    if (userLocation) {
        mapStore.setCenterWithAnimation(userLocation[0], userLocation[1], 18, 1800);
    }
};
</script>