/**
 * MAP STORE
 *
 * Este store gestiona el estado y las operaciones del mapa:
 * - Instancia del mapa de Leaflet
 * - Marcadores en el mapa
 * - Información de rutas (distancia y duración)
 * - Controles de zoom y centrado
 */

import { defineStore } from "pinia";
import { ref } from "vue";

export const useMapStore = defineStore("map", () => {
  // ============================================
  // ESTADO (STATE)
  // ============================================

  /**
   * mapInstance: Instancia del mapa de Leaflet
   * null si el mapa no se ha inicializado aún
   */
  const mapInstance = ref<L.Map | null>(null);

  /**
   * markers: Array de marcadores en el mapa
   * Se usa para gestionar los marcadores activos
   */
  const markers = ref<L.Marker[]>([]);

  /**
   * distance: Distancia de la ruta actual en metros
   * null si no hay ruta calculada
   */
  const distance = ref<number | null>(null);

  /**
   * duration: Duración de la ruta actual en segundos
   * null si no hay ruta calculada
   */
  const duration = ref<number | null>(null);

  // ============================================
  // GETTERS (COMPUTADOS)
  // ============================================

  /**
   * getMapInstance: Obtiene la instancia del mapa
   * @returns La instancia del mapa o null
   */
  const getMapInstance = () => mapInstance.value;

  /**
   * getMarkers: Obtiene todos los marcadores
   * @returns Array de marcadores
   */
  const getMarkers = () => markers.value;

  /**
   * getDistance: Obtiene la distancia de la ruta
   * @returns Distancia en metros o null
   */
  const getDistance = () => distance.value;

  /**
   * getDuration: Obtiene la duración de la ruta
   * @returns Duración en segundos o null
   */
  const getDuration = () => duration.value;

  // ============================================
  // ACCIONES (ACTIONS)
  // ============================================

  /**
   * setMap: Establece la instancia del mapa
   * @param map - Instancia del mapa de Leaflet
   */
  const setMap = (map: L.Map) => {
    mapInstance.value = map;
  };

  /**
   * zoomIn: Aumenta el zoom del mapa
   */
  const zoomIn = () => {
    mapInstance.value?.zoomIn();
  };

  /**
   * zoomOut: Disminuye el zoom del mapa
   */
  const zoomOut = () => {
    mapInstance.value?.zoomOut();
  };

  /**
   * setCenter: Centra el mapa en coordenadas específicas
   * @param lat - Latitud
   * @param lng - Longitud
   * @param zoom - Nivel de zoom opcional
   */
  const setCenter = (lat: number, lng: number, zoom?: number) => {
    if (mapInstance.value) {
      mapInstance.value.setView([lat, lng], zoom);
    }
  };

  /**
   * setCenterWithAnimation: Centra el mapa con animación
   * @param lat - Latitud
   * @param lng - Longitud
   * @param zoom - Nivel de zoom opcional
   * @param duration - Duración de la animación en milisegundos (por defecto 1000)
   */
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

  /**
   * setZoom: Establece el nivel de zoom
   * @param zoom - Nivel de zoom
   */
  const setZoom = (zoom: number) => {
    mapInstance.value?.setZoom(zoom);
  };

  /**
   * fitBounds: Ajusta el mapa para mostrar todos los límites dados
   * @param bounds - Límites a mostrar
   */
  const fitBounds = (bounds: L.LatLngBoundsExpression) => {
    mapInstance.value?.fitBounds(bounds);
  };

  // ============================================
  // ACCIONES PARA MARCADORES
  // ============================================

  /**
   * addMarker: Añade un marcador al mapa
   * @param marker - Marcador a añadir
   */
  const addMarker = (marker: L.Marker) => {
    markers.value.push(marker);
  };

  /**
   * clearMarkers: Elimina todos los marcadores
   */
  const clearMarkers = () => {
    markers.value = [];
  };

  /**
   * removeMarker: Elimina un marcador específico
   * @param marker - Marcador a eliminar
   */
  const removeMarker = (marker: L.Marker) => {
    markers.value = markers.value.filter((m) => m !== marker);
  };

  // ============================================
  // ACCIONES PARA DATOS DE RUTA
  // ============================================

  /**
   * setDistance: Establece la distancia de la ruta
   * @param dist - Distancia en metros
   */
  const setDistance = (dist: number) => {
    distance.value = dist;
  };

  /**
   * setDuration: Establece la duración de la ruta
   * @param dur - Duración en segundos
   */
  const setDuration = (dur: number) => {
    duration.value = dur;
  };

  /**
   * clearRouteData: Limpia los datos de distancia y duración
   */
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
