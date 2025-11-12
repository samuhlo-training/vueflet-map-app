/**
 * PLACES STORE
 *
 * Este store gestiona la ubicación del usuario y la búsqueda de lugares:
 * - Obtención de la ubicación actual del usuario
 * - Búsqueda de lugares usando Nominatim
 * - Gestión de resultados de búsqueda
 * - Control de marcadores de búsqueda
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { UserLocation } from "@/modules/map/interfaces/map.interfaces";
import type { Place } from "../interfaces/place.interfaces";

export const usePlacesStore = defineStore("places", () => {
  // ============================================
  // ESTADO (STATE)
  // ============================================

  /**
   * isLoading: Indica si se está cargando la ubicación inicial
   * true mientras se obtiene la ubicación del usuario
   */
  const isLoading = ref<boolean>(true);

  /**
   * userLocation: Ubicación actual del usuario
   * undefined si no se ha obtenido aún
   */
  const userLocation = ref<UserLocation>(undefined);

  /**
   * locationError: Tipo de error al obtener la ubicación
   * null si no hay error, o código de error de geolocalización
   */
  const locationError = ref<number | null>(null);

  /**
   * searchResults: Resultados de la búsqueda de lugares
   * Array vacío cuando no hay resultados
   */
  const searchResults = ref<Place[]>([]);

  /**
   * isSearching: Indica si se está realizando una búsqueda
   * true durante las llamadas a la API de Nominatim
   */
  const isSearching = ref<boolean>(false);

  /**
   * activePlaceId: ID del lugar actualmente seleccionado
   * null si no hay lugar activo
   */
  const activePlaceId = ref<number | null>(null);

  /**
   * showSearchMarkers: Controla si se muestran los marcadores de búsqueda
   * false cuando estamos en modo direcciones
   */
  const showSearchMarkers = ref<boolean>(true);

  // ============================================
  // GETTERS (COMPUTADOS)
  // ============================================

  /**
   * isUserLocationReady: ¿La ubicación del usuario está lista?
   * true si userLocation tiene un valor definido
   */
  const isUserLocationReady = computed<boolean>(() => {
    return !!userLocation.value;
  });

  // ============================================
  // ACCIONES (ACTIONS)
  // ============================================

  /**
   * getCurrentPosition: Obtiene la ubicación actual del usuario
   *
   * Usa la API de geolocalización del navegador para obtener
   * las coordenadas del usuario. Actualiza isLoading y userLocation.
   *
   * @returns Promise que resuelve con la ubicación [lat, lon]
   */
  const getCurrentPosition = (): Promise<UserLocation> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const location: UserLocation = [coords.latitude, coords.longitude];
          userLocation.value = location;
          isLoading.value = false;
          locationError.value = null;
          resolve(location);
        },
        (err) => {
          isLoading.value = false;
          locationError.value = err.code;
          console.error("Error obteniendo ubicación:", err);
          reject(err);
        }
      );
    });
  };

  /**
   * searchPlaces: Busca lugares por texto usando Nominatim
   *
   * Realiza una búsqueda en la API de OpenStreetMap Nominatim
   * y actualiza searchResults con los resultados encontrados.
   *
   * @param query - Texto a buscar (dirección, lugar, etc.)
   */
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
      // Datos obtenidos

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

  /**
   * setActivePlaceId: Establece el lugar activo
   * @param id - ID del lugar a activar, o null para desactivar
   */
  const setActivePlaceId = (id: number | null) => {
    activePlaceId.value = id;
  };

  /**
   * hideSearchMarkers: Oculta los marcadores de búsqueda
   * Se usa cuando cambiamos a modo direcciones
   */
  const hideSearchMarkers = () => {
    showSearchMarkers.value = false;
  };

  /**
   * showSearchMarkersAgain: Vuelve a mostrar los marcadores de búsqueda
   * Se usa cuando volvemos a modo búsqueda
   */
  const showSearchMarkersAgain = () => {
    showSearchMarkers.value = true;
  };

  return {
    // State
    isLoading,
    userLocation,
    locationError,
    searchResults,
    isSearching,
    activePlaceId,
    showSearchMarkers,
    // Getters
    isUserLocationReady,
    // Actions
    getCurrentPosition,
    searchPlaces,
    setActivePlaceId,
    hideSearchMarkers,
    showSearchMarkersAgain,
  };
});
