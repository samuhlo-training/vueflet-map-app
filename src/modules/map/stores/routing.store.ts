/**
 * ROUTING STORE
 *
 * Este store gestiona TODO lo relacionado con el sistema de direcciones:
 * - El modo de la UI (búsqueda vs direcciones)
 * - Los waypoints (origen, destino, paradas)
 * - Las rutas calculadas
 * - El modo de transporte seleccionado
 *
 * Piensa en el store como el "cerebro" que guarda toda la información
 * y permite que los componentes la compartan.
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  Waypoint,
  Route,
  TravelMode,
  UIMode,
  RoutingError,
} from "../interfaces/routing.interfaces";
import { routingService } from "../services/routing.service";
import { usePlacesStore } from "./places.store";

export const useRoutingStore = defineStore("routing", () => {
  // ============================================
  // ESTADO (STATE)
  // ============================================
  // El estado son las variables que guardan la información.
  // Cuando estas cambian, Vue actualiza automáticamente la UI.

  /**
   * uiMode: Controla si estamos en modo búsqueda o direcciones
   * - 'search': Muestra el SearchBar normal
   * - 'directions': Muestra el DirectionsPanel
   */
  const uiMode = ref<UIMode>("search");

  /**
   * waypoints: Array de puntos en la ruta
   * Ejemplo: [origen, parada1, parada2, destino]
   */
  const waypoints = ref<Waypoint[]>([]);

  /**
   * currentRoute: La ruta actual calculada
   * null = no hay ruta calculada todavía
   */
  const currentRoute = ref<Route | null>(null);

  /**
   * travelMode: Modo de transporte seleccionado
   * Por defecto: 'driving' (coche)
   */
  const travelMode = ref<TravelMode>("driving");

  /**
   * isCalculatingRoute: Indica si estamos calculando una ruta
   * true = mostramos un spinner/loading
   */
  const isCalculatingRoute = ref<boolean>(false);

  /**
   * routingError: Error que ocurrió al calcular la ruta
   * null = no hay error
   */
  const routingError = ref<RoutingError | null>(null);

  // ============================================
  // GETTERS (COMPUTADOS)
  // ============================================
  // Los getters son valores que se calculan automáticamente
  // a partir del estado. Son como "fórmulas" en Excel.

  /**
   * isDirectionsMode: ¿Estamos en modo direcciones?
   * true si uiMode === 'directions'
   */
  const isDirectionsMode = computed(() => uiMode.value === "directions");

  /**
   * hasWaypoints: ¿Hay waypoints añadidos?
   */
  const hasWaypoints = computed(() => waypoints.value.length > 0);

  /**
   * hasRoute: ¿Hay una ruta calculada?
   */
  const hasRoute = computed(() => currentRoute.value !== null);

  /**
   * originWaypoint: El primer waypoint (origen)
   * undefined si no hay waypoints
   */
  const originWaypoint = computed(() => {
    return waypoints.value.find((wp) => wp.type === "origin");
  });

  /**
   * destinationWaypoint: El último waypoint (destino)
   * undefined si no hay waypoints
   */
  const destinationWaypoint = computed(() => {
    return waypoints.value.find((wp) => wp.type === "destination");
  });

  /**
   * intermediateWaypoints: Waypoints intermedios (paradas)
   * Array vacío si no hay paradas
   */
  const intermediateWaypoints = computed(() => {
    return waypoints.value.filter((wp) => wp.type === "waypoint");
  });

  /**
   * canCalculateRoute: ¿Se puede calcular una ruta?
   * Necesitamos al menos origen y destino
   */
  const canCalculateRoute = computed(() => {
    return (
      originWaypoint.value !== undefined &&
      destinationWaypoint.value !== undefined
    );
  });

  /**
   * formattedDistance: Distancia formateada para mostrar
   * Ejemplo: "2.5 km" o "450 m"
   */
  const formattedDistance = computed(() => {
    if (!currentRoute.value) return "";

    const meters = currentRoute.value.distance;
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  });

  /**
   * formattedDuration: Duración formateada para mostrar
   * Ejemplo: "25 min" o "1h 30min"
   */
  const formattedDuration = computed(() => {
    if (!currentRoute.value) return "";

    const seconds = currentRoute.value.duration;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  });

  // ============================================
  // ACCIONES (ACTIONS)
  // ============================================
  // Las acciones son funciones que modifican el estado.
  // Son como "comandos" que ejecutamos para cambiar cosas.

  /**
   * setDirectionsMode: Cambia al modo de direcciones
   *
   * Esto hace que se muestre el DirectionsPanel en lugar del SearchBar.
   * También oculta los marcadores de búsqueda.
   */
  const setDirectionsMode = () => {
    uiMode.value = "directions";
    // Ocultar marcadores de búsqueda cuando entramos en modo direcciones
    const placesStore = usePlacesStore();
    placesStore.hideSearchMarkers();
  };

  /**
   * setSearchMode: Vuelve al modo de búsqueda
   *
   * También limpia todos los waypoints y la ruta, y vuelve a mostrar
   * los marcadores de búsqueda.
   */
  const setSearchMode = () => {
    uiMode.value = "search";
    clearRoute();
    // Volver a mostrar los marcadores de búsqueda
    const placesStore = usePlacesStore();
    placesStore.showSearchMarkersAgain();
  };

  /**
   * setTravelMode: Cambia el modo de transporte
   *
   * @param mode - 'driving', 'cycling' o 'walking'
   *
   * Cuando cambiamos el modo, deberíamos recalcular la ruta
   * automáticamente si ya hay waypoints
   */
  const setTravelMode = (mode: TravelMode) => {
    travelMode.value = mode;
    // TODO: Recalcular ruta automáticamente si hay waypoints
  };

  /**
   * addWaypoint: Añade un nuevo waypoint
   *
   * @param waypoint - El waypoint a añadir
   *
   * Ejemplo de uso:
   * addWaypoint({
   *   id: crypto.randomUUID(),
   *   name: 'Plaza Mayor',
   *   coordinates: [40.4168, -3.7038],
   *   type: 'origin',
   *   order: 0
   * })
   */
  const addWaypoint = (waypoint: Waypoint) => {
    waypoints.value.push(waypoint);
    // Reordenar waypoints por order
    waypoints.value.sort((a, b) => a.order - b.order);
  };

  /**
   * removeWaypoint: Elimina un waypoint por su ID
   *
   * @param id - ID del waypoint a eliminar
   */
  const removeWaypoint = (id: string) => {
    waypoints.value = waypoints.value.filter((wp) => wp.id !== id);
    // Reordenar los orders
    reorderWaypoints();
  };

  /**
   * updateWaypoint: Actualiza un waypoint existente
   *
   * @param id - ID del waypoint a actualizar
   * @param updates - Propiedades a actualizar
   */
  const updateWaypoint = (id: string, updates: Partial<Waypoint>) => {
    const index = waypoints.value.findIndex((wp) => wp.id === id);
    if (index !== -1) {
      waypoints.value[index] = {
        ...waypoints.value[index],
        ...updates,
      } as Waypoint;
    }
  };

  /**
   * setOrigin: Establece el origen de la ruta
   *
   * @param name - Nombre del lugar
   * @param coordinates - [latitud, longitud]
   * @param placeId - ID opcional del lugar
   */
  const setOrigin = (
    name: string,
    coordinates: [number, number],
    placeId?: number
  ) => {
    // Si ya existe un origen, lo actualizamos
    const existingOrigin = originWaypoint.value;
    if (existingOrigin) {
      updateWaypoint(existingOrigin.id, { name, coordinates, placeId });
    } else {
      // Si no existe, lo creamos
      addWaypoint({
        id: crypto.randomUUID(),
        name,
        coordinates,
        type: "origin",
        order: 0,
        placeId,
      });
    }
  };

  /**
   * setDestination: Establece el destino de la ruta
   *
   * @param name - Nombre del lugar
   * @param coordinates - [latitud, longitud]
   * @param placeId - ID opcional del lugar
   */
  const setDestination = (
    name: string,
    coordinates: [number, number],
    placeId?: number
  ) => {
    // Si ya existe un destino, lo actualizamos
    const existingDestination = destinationWaypoint.value;
    if (existingDestination) {
      updateWaypoint(existingDestination.id, { name, coordinates, placeId });
    } else {
      // Si no existe, lo creamos
      // El order del destino es siempre el máximo + 1
      const maxOrder =
        waypoints.value.length > 0
          ? Math.max(...waypoints.value.map((wp) => wp.order))
          : -1;

      addWaypoint({
        id: crypto.randomUUID(),
        name,
        coordinates,
        type: "destination",
        order: maxOrder + 1,
        placeId,
      });
    }
  };

  /**
   * addIntermediateWaypoint: Añade una parada intermedia
   *
   * @param name - Nombre del lugar
   * @param coordinates - [latitud, longitud]
   * @param placeId - ID opcional del lugar
   */
  const addIntermediateWaypoint = (
    name: string,
    coordinates: [number, number],
    placeId?: number
  ) => {
    // Las paradas intermedias van entre el origen y el destino
    const destination = destinationWaypoint.value;
    const order = destination ? destination.order : waypoints.value.length;

    addWaypoint({
      id: crypto.randomUUID(),
      name,
      coordinates,
      type: "waypoint",
      order,
      placeId,
    });

    // Si hay destino, incrementamos su order
    if (destination) {
      updateWaypoint(destination.id, { order: order + 1 });
    }
  };

  /**
   * swapOriginDestination: Intercambia origen y destino
   *
   * Esto es útil para "invertir" la ruta rápidamente
   */
  const swapOriginDestination = () => {
    const origin = originWaypoint.value;
    const destination = destinationWaypoint.value;

    if (!origin || !destination) return;

    // Intercambiamos los tipos
    updateWaypoint(origin.id, { type: "destination" });
    updateWaypoint(destination.id, { type: "origin" });

    // Intercambiamos los orders
    const tempOrder = origin.order;
    updateWaypoint(origin.id, { order: destination.order });
    updateWaypoint(destination.id, { order: tempOrder });

    // Reordenar
    waypoints.value.sort((a, b) => a.order - b.order);
  };

  /**
   * reorderWaypoints: Reordena los waypoints secuencialmente
   *
   * Asegura que los orders sean 0, 1, 2, 3... sin huecos
   */
  const reorderWaypoints = () => {
    waypoints.value.forEach((wp, index) => {
      wp.order = index;
    });
  };

  /**
   * clearRoute: Limpia la ruta y todos los waypoints
   */
  const clearRoute = () => {
    waypoints.value = [];
    currentRoute.value = null;
    routingError.value = null;
  };

  /**
   * setRoute: Establece la ruta calculada
   *
   * @param route - La ruta calculada por el servicio
   */
  const setRoute = (route: Route) => {
    currentRoute.value = route;
    routingError.value = null;
  };

  /**
   * setRoutingError: Establece un error de routing
   *
   * @param error - El error que ocurrió
   */
  const setRoutingError = (error: RoutingError) => {
    routingError.value = error;
    currentRoute.value = null;
  };

  /**
   * clearRoutingError: Limpia el error de routing
   */
  const clearRoutingError = () => {
    routingError.value = null;
  };

  /**
   * calculateRoute: Calcula la ruta usando el servicio de routing
   *
   * Esta función:
   * 1. Valida que haya al menos origen y destino
   * 2. Llama al servicio de routing (OSRM)
   * 3. Guarda la ruta calculada en el estado
   * 4. Maneja errores si algo falla
   */
  const calculateRoute = async () => {
    // Validación: necesitamos al menos origen y destino
    if (!canCalculateRoute.value) {
      console.warn("No se puede calcular la ruta: faltan waypoints");
      setRoutingError({
        code: "INVALID_WAYPOINTS",
        message: "Necesitas al menos un origen y un destino",
      });
      return;
    }

    // Activar estado de loading
    isCalculatingRoute.value = true;
    clearRoutingError();

    try {
      console.log("🚗 Calculando ruta...", {
        waypoints: waypoints.value.length,
        travelMode: travelMode.value,
      });

      // Llamar al servicio de routing
      const route = await routingService.getRoute(
        waypoints.value,
        travelMode.value
      );

      // Guardar la ruta calculada
      setRoute(route);

      console.log("✅ Ruta calculada exitosamente:", {
        distance: route.distance,
        duration: route.duration,
        segments: route.segments.length,
      });
    } catch (error) {
      // Si el servicio devuelve un RoutingError, lo usamos directamente
      if (isRoutingError(error)) {
        setRoutingError(error);
      } else {
        // Si es otro tipo de error, lo envolvemos
        console.error("❌ Error calculando ruta:", error);
        setRoutingError({
          code: "API_ERROR",
          message: "No se pudo calcular la ruta",
          details: error,
        });
      }
    } finally {
      // Desactivar estado de loading
      isCalculatingRoute.value = false;
    }
  };

  /**
   * isRoutingError: Verifica si un error es un RoutingError
   *
   * @param error - Error a verificar
   * @returns true si es un RoutingError
   */
  const isRoutingError = (error: any): error is RoutingError => {
    return (
      error &&
      typeof error.code === "string" &&
      typeof error.message === "string"
    );
  };

  // ============================================
  // RETURN (EXPORTAR)
  // ============================================
  // Devolvemos todo lo que queremos usar en los componentes

  return {
    // Estado
    uiMode,
    waypoints,
    currentRoute,
    travelMode,
    isCalculatingRoute,
    routingError,

    // Getters
    isDirectionsMode,
    hasWaypoints,
    hasRoute,
    originWaypoint,
    destinationWaypoint,
    intermediateWaypoints,
    canCalculateRoute,
    formattedDistance,
    formattedDuration,

    // Acciones
    setDirectionsMode,
    setSearchMode,
    setTravelMode,
    addWaypoint,
    removeWaypoint,
    updateWaypoint,
    setOrigin,
    setDestination,
    addIntermediateWaypoint,
    swapOriginDestination,
    clearRoute,
    setRoute,
    setRoutingError,
    clearRoutingError,
    calculateRoute,
  };
});
