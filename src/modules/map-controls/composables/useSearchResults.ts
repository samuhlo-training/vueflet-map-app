// SearchResults.ts
import { usePlacesStore } from "@/modules/map/stores/places.store";
import { useMapStore } from "@/modules/map/stores/map.store";
import { useRoutingStore } from "@/modules/map/stores/routing.store";
import { computed, watch } from "vue";

export const useSearchResults = () => {
  const placesStore = usePlacesStore();
  const mapStore = useMapStore();
  const routingStore = useRoutingStore();

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
    const normalizedType = addresstype.toLowerCase();
    const zoom = zoomLevels[normalizedType] || 13;
    return zoom;
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
    () => {
      // Resultados actualizados
    }
  );

  /**
   * handleGetDirections: Maneja el click en el botón "Cómo llegar"
   *
   * Esta función:
   * 1. Cambia el modo de la UI a "directions"
   * 2. Establece el lugar seleccionado como DESTINO
   * 3. Intenta usar la ubicación actual del usuario como ORIGEN
   * 4. Si no hay ubicación del usuario, deja el origen vacío para que lo complete
   *
   * @param placeId - ID del lugar seleccionado
   */
  const handleGetDirections = (placeId: number) => {
    // Buscar el lugar en los resultados
    const place = placesStore.searchResults.find((p) => p.id === placeId);

    if (!place) {
      console.warn("No se encontró el lugar con ID:", placeId);
      return;
    }

    // 1. Cambiar al modo de direcciones
    routingStore.setDirectionsMode();

    // 2. Establecer el lugar como DESTINO
    const [lat, lon] = place.coordinates;
    routingStore.setDestination(
      place.name,
      [lat, lon],
      place.id // placeId de Nominatim
    );

    // 3. Intentar establecer la ubicación actual como ORIGEN
    if (placesStore.isUserLocationReady && placesStore.userLocation) {
      const [userLat, userLon] = placesStore.userLocation;
      routingStore.setOrigin("Mi ubicación", [userLat, userLon]);

      // 4. Calcular la ruta automáticamente
      // (solo si tenemos origen y destino)
      routingStore.calculateRoute();
    } else {
      // El usuario tendrá que establecer manualmente el origen
    }

    // 5. Mover el mapa al destino
    const zoom = getZoomByAddressType(place.addresstype);
    mapStore.setCenterWithAnimation(lat, lon, zoom, 2100);
  };

  return {
    // State
    results: computed(() => placesStore.searchResults),
    isSearching: computed(() => placesStore.isSearching),
    activePlace: computed(() => placesStore.activePlaceId),

    // Getters

    // Actions
    onPlaceClick,
    handleGetDirections, // Nueva acción
  };
};
