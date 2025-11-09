import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { UserLocation } from "@/modules/map/interfaces/map.interfaces";
import type { Place } from "../interfaces/place.interfaces";

export const usePlacesStore = defineStore("places", () => {
  // State - Cada propiedad separada (patrón correcto de Pinia)
  const isLoading = ref<boolean>(true);
  const userLocation = ref<UserLocation>(undefined);
  const searchResults = ref<Place[]>([]);
  const isSearching = ref<boolean>(false);
  const activePlaceId = ref<number | null>(null);

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

  // Búsqueda de lugares por texto
  const searchPlaces = async (query: string): Promise<void> => {
    if (!query) {
      searchResults.value = [];
      activePlaceId.value = null;
      return;
    }

    isSearching.value = true;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          `format=json&q=${encodeURIComponent(query)}&limit=4`
      );
      const data = await response.json();
      console.log({ data });

      searchResults.value = data.map((item: any) => ({
        id: item.place_id,
        name: item.display_name,
        addresstype: item.addresstype,
        coordinates: [parseFloat(item.lat), parseFloat(item.lon)],
      }));
      activePlaceId.value = null; // Reset active place on new search
    } catch (error) {
      console.error("Error buscando lugares:", error);
      searchResults.value = [];
      activePlaceId.value = null;
    } finally {
      isSearching.value = false;
    }
  };

  const setActivePlaceId = (id: number | null) => {
    activePlaceId.value = id;
  };

  return {
    // State
    isLoading,
    userLocation,
    searchResults,
    isSearching,
    activePlaceId,
    // Getters
    isUserLocationReady,
    // Actions
    getCurrentPosition,
    searchPlaces,
    setActivePlaceId,
  };
});
