// SearchResults.ts
import { usePlacesStore } from "@/modules/map/stores/places.store";
import { useMapStore } from "@/modules/map/stores/map.store";
import { computed, watch } from "vue";

export const useSearchResults = () => {
  const placesStore = usePlacesStore();
  const mapStore = useMapStore();

  // Función para determinar el zoom según el tipo de dirección
  const getZoomByAddressType = (addresstype: string): number => {
    const zoomLevels: Record<string, number> = {
      // Países y continentes - zoom lejano
      country: 5,
      continent: 3,

      // Regiones grandes - zoom medio-lejano
      state: 7,
      region: 7,
      province: 8,

      // Ciudades y localidades - zoom medio
      city: 11,
      town: 12,
      village: 13,
      municipality: 12,

      // Vecindarios y distritos - zoom medio-cercano
      neighbourhood: 14,
      suburb: 14,
      district: 13,
      quarter: 14,

      // Lugares específicos - zoom cercano
      place: 18,
      amenity: 17,
      building: 18,
      house: 18,
      address: 18,
      road: 16,
      street: 16,

      // Puntos de interés - zoom muy cercano
      poi: 17,
      shop: 18,
      restaurant: 18,
    };

    // Retornar el zoom específico o un valor por defecto
    return zoomLevels[addresstype] || 13;
  };

  // Función para establecer el lugar activo
  const onPlaceClick = (placeId: number) => {
    // Mover mapa a la ubicación del lugar seleccionado
    const place = placesStore.searchResults.find((p) => p.id === placeId);
    if (place) {
      const [lat, lon] = place.coordinates;
      const zoom = getZoomByAddressType(place.addresstype);
      mapStore.setCenterWithAnimation(lat, lon, zoom, 2100);
    }
    placesStore.setActivePlaceId(placeId);
  };

  // Observar cambios en los resultados
  watch(
    () => placesStore.searchResults,
    (newResults) => {
      console.log("Resultados actualizados:", newResults);
    }
  );

  return {
    // State
    results: computed(() => placesStore.searchResults),
    isSearching: computed(() => placesStore.isSearching),
    activePlace: computed(() => placesStore.activePlaceId),

    // Getters

    // Actions
    onPlaceClick,
  };
};
