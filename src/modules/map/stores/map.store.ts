import { defineStore } from "pinia";
import { ref } from "vue";

export const useMapStore = defineStore("map", () => {
  // State
  const mapInstance = ref<L.Map | null>(null);
  const markers = ref<L.Marker[]>([]);
  const distance = ref<number | null>(null);
  const duration = ref<number | null>(null);

  // Getters
  const getMapInstance = () => mapInstance.value;
  const getMarkers = () => markers.value;
  const getDistance = () => distance.value;
  const getDuration = () => duration.value;

  // Actions
  const setMap = (map: L.Map) => {
    mapInstance.value = map;
  };

  const zoomIn = () => {
    mapInstance.value?.zoomIn();
  };

  const zoomOut = () => {
    mapInstance.value?.zoomOut();
  };

  const setCenter = (lat: number, lng: number, zoom?: number) => {
    if (mapInstance.value) {
      mapInstance.value.setView([lat, lng], zoom);
    }
  };

  const setCenterWithAnimation = (
    lat: number,
    lng: number,
    zoom?: number,
    duration: number = 1000
  ) => {
    if (mapInstance.value) {
      mapInstance.value.flyTo([lat, lng], zoom || mapInstance.value.getZoom(), {
        duration: duration / 1000, // flyTo usa segundos
        easeLinearity: 0.25,
      });
    }
  };

  const setZoom = (zoom: number) => {
    mapInstance.value?.setZoom(zoom);
  };

  const fitBounds = (bounds: L.LatLngBoundsExpression) => {
    mapInstance.value?.fitBounds(bounds);
  };

  // Acciones para markers
  const addMarker = (marker: L.Marker) => {
    markers.value.push(marker);
  };

  const clearMarkers = () => {
    markers.value = [];
  };

  const removeMarker = (marker: L.Marker) => {
    markers.value = markers.value.filter((m) => m !== marker);
  };

  // Acciones para distancia y duración
  const setDistance = (dist: number) => {
    distance.value = dist;
  };

  const setDuration = (dur: number) => {
    duration.value = dur;
  };

  const clearRouteData = () => {
    distance.value = null;
    duration.value = null;
  };

  return {
    // State
    mapInstance,
    markers,
    distance,
    duration,
    // Getters
    getMapInstance,
    getMarkers,
    getDistance,
    getDuration,
    // Actions
    setMap,
    zoomIn,
    zoomOut,
    setCenter,
    setCenterWithAnimation,
    setZoom,
    fitBounds,
    addMarker,
    clearMarkers,
    removeMarker,
    setDistance,
    setDuration,
    clearRouteData,
  };
});
