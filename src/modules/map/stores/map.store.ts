import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { UserLocation } from "../interfaces/map.interfaces";

export const useMapStore = defineStore("map", () => {
  // State - Cada propiedad separada (patrón correcto de Pinia)
  const isLoading = ref<boolean>(true);
  const userLocation = ref<UserLocation>(undefined);

  // Getters - Propiedades computadas derivadas del estado
  const isUserLocationReady = computed<boolean>(() => {
    return !!userLocation.value;
  });

  // Actions - Funciones que modifican el estado
  const getCurrentPosition = (): Promise<UserLocation> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const location: UserLocation = [coords.latitude, coords.longitude];
          userLocation.value = location;
          isLoading.value = false;
          resolve(location);
        },
        (err) => {
          isLoading.value = false;
          console.error("Error obteniendo ubicación:", err);
          reject(err);
        }
      );
    });
  };

  return {
    // State
    isLoading,
    userLocation,
    // Getters
    isUserLocationReady,
    // Actions
    getCurrentPosition,
  };
});
