import { computed } from "vue";
import { useRoutingStore } from "@/modules/map/stores/routing.store";
export const useRoutesAlternatives = () => {
  const routingStore = useRoutingStore();

  // ============================================
  // COMPUTED
  // ============================================

  const currentRoute = computed(() => routingStore.currentRoute);
  const alternativeRoutes = computed(() => routingStore.alternativeRoutes);

  /**
   * hasAlternatives: ¿Hay rutas alternativas disponibles?
   */
  const hasAlternatives = computed(() => {
    return alternativeRoutes.value && alternativeRoutes.value.length > 0;
  });

  /**
   * allRoutes: Todas las rutas (principal + alternativas) con info adicional
   * ORDENADAS de más rápida a más lenta
   */
  const allRoutes = computed(() => {
    if (!currentRoute.value) return [];

    const routes = [
      {
        route: currentRoute.value,
        index: -1,
        isAlternative: false,
      },
      ...alternativeRoutes.value.map((route, index) => ({
        route,
        index,
        isAlternative: true,
      })),
    ];

    // Encontrar la ruta más rápida
    const fastestDuration = Math.min(...routes.map((r) => r.route.duration));

    const routesWithInfo = routes.map((r) => ({
      ...r,
      isFastest: r.route.duration === fastestDuration,
      timeDiff: r.route.duration - fastestDuration,
      distanceDiff:
        r.route.distance -
        routes.find((fr) => fr.route.duration === fastestDuration)!.route
          .distance,
    }));

    // Ordenar por duración (más rápida primero)
    return routesWithInfo.sort((a, b) => a.route.duration - b.route.duration);
  });

  // ============================================
  // METHODS
  // ============================================

  /**
   * handleSelectRoute: Selecciona una ruta
   * @param index - Índice de la alternativa (-1 = principal, 0+ = alternativas)
   */
  const handleSelectRoute = (index: number) => {
    // Siempre llamar al store con el índice
    // El store se encarga de actualizar los flags isSelected correctamente
    routingStore.selectAlternativeRoute(index);
  };

  /**
   * formatDuration: Formatea la duración en formato legible
   */
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  /**
   * formatDistance: Formatea la distancia en formato legible
   */
  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  /**
   * formatTimeDifference: Formatea la diferencia de tiempo
   */
  const formatTimeDifference = (diffSeconds: number): string => {
    const absMinutes = Math.abs(Math.floor(diffSeconds / 60));
    const sign = diffSeconds >= 0 ? "+" : "-";

    if (absMinutes < 1) return `${sign}<1 min`;
    if (absMinutes < 60) return `${sign}${absMinutes} min`;

    const hours = Math.floor(absMinutes / 60);
    const remainingMinutes = absMinutes % 60;
    return `${sign}${hours}h ${remainingMinutes}min`;
  };

  /**
   * formatDistanceDifference: Formatea la diferencia de distancia
   */
  const formatDistanceDifference = (diffMeters: number): string => {
    const absMeters = Math.abs(diffMeters);
    const sign = diffMeters >= 0 ? "+" : "-";

    if (absMeters >= 1000) {
      return `${sign}${(absMeters / 1000).toFixed(1)} km`;
    }
    return `${sign}${Math.round(absMeters)} m`;
  };

  return {
    // State
    currentRoute,
    alternativeRoutes,
    hasAlternatives,
    allRoutes,
    // Methods
    handleSelectRoute,
    formatDuration,
    formatDistance,
    formatTimeDifference,
    formatDistanceDifference,
  };
};
