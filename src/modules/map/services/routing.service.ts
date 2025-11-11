/**
 * ROUTING SERVICE
 *
 * Este servicio se comunica con la API de OSRM (Open Source Routing Machine)
 * para calcular rutas entre múltiples puntos.
 *
 * OSRM es gratuito y open source, perfecto para nuestra aplicación.
 * Documentación: http://project-osrm.org/docs/v5.24.0/api/
 */

import type {
  Route,
  RouteSegment,
  TravelMode,
  Waypoint,
  RoutingError,
} from "../interfaces/routing.interfaces";

// ============================================
// CONFIGURACIÓN
// ============================================

/**
 * URL base de OSRM
 *
 * NOTA IMPORTANTE: El servidor público de OSRM solo proporciona routing
 * para coches (car). Los servidores de bike y foot NO están disponibles
 * públicamente debido a los altos requisitos de hardware (+128GB RAM).
 *
 * Solución: Usamos siempre la ruta de 'car' y calculamos los tiempos
 * nosotros mismos según el modo de transporte usando velocidades promedio.
 */
const OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/car";

/**
 * Velocidades promedio para cada modo de transporte (km/h)
 *
 * Estas velocidades son estimaciones realistas:
 * - Driving: Usamos el tiempo de OSRM (es preciso para coches)
 * - Cycling: 15 km/h (velocidad promedio en bici urbana)
 * - Walking: 5 km/h (velocidad promedio caminando)
 */
const AVERAGE_SPEEDS: Record<TravelMode, number> = {
  driving: 0, // No se usa, tomamos el tiempo de OSRM
  cycling: 15, // km/h
  walking: 5, // km/h
};

// ============================================
// INTERFACES INTERNAS (respuesta de OSRM)
// ============================================

/**
 * Estas interfaces definen cómo OSRM nos devuelve los datos.
 * Son diferentes a nuestras interfaces porque cada API tiene su formato.
 */

interface OSRMCoordinate {
  /** [longitud, latitud] - ¡Cuidado! OSRM usa lon,lat (al revés de Leaflet) */
  0: number;
  1: number;
}

interface OSRMStep {
  distance: number;
  duration: number;
  geometry: {
    coordinates: OSRMCoordinate[];
  };
  name: string;
  maneuver: {
    type: string;
    instruction?: string;
  };
}

interface OSRMLeg {
  distance: number;
  duration: number;
  steps: OSRMStep[];
}

interface OSRMRoute {
  distance: number;
  duration: number;
  legs: OSRMLeg[];
  geometry: {
    coordinates: OSRMCoordinate[];
  };
}

interface OSRMResponse {
  code: string;
  routes: OSRMRoute[];
  waypoints: Array<{
    location: OSRMCoordinate;
    name: string;
  }>;
}

// ============================================
// CLASE DEL SERVICIO
// ============================================

/**
 * RoutingService: Servicio para calcular rutas
 *
 * Esta clase encapsula toda la lógica de comunicación con OSRM
 */
class RoutingService {
  /**
   * getRoute: Calcula una ruta entre múltiples waypoints
   *
   * @param waypoints - Array de waypoints ordenados (origen, paradas, destino)
   * @param travelMode - Modo de transporte
   * @returns Promise con la ruta calculada
   * @throws RoutingError si algo falla
   *
   * Ejemplo de uso:
   * const route = await routingService.getRoute(
   *   [originWaypoint, destinationWaypoint],
   *   'driving'
   * );
   *
   * NOTA: Este método devuelve solo la ruta principal.
   * Para obtener rutas alternativas, usa getRoutes()
   */
  async getRoute(
    waypoints: Waypoint[],
    travelMode: TravelMode
  ): Promise<Route> {
    const routes = await this.getRoutes(waypoints, travelMode, 0);
    if (!routes[0]) {
      throw this.createError("NO_ROUTE", "No se pudo calcular ninguna ruta");
    }
    return routes[0];
  }

  /**
   * getRoutes: Calcula múltiples rutas alternativas
   *
   * @param waypoints - Array de waypoints ordenados (origen, paradas, destino)
   * @param travelMode - Modo de transporte
   * @param maxAlternatives - Número máximo de rutas alternativas (por defecto 2)
   * @returns Promise con array de rutas (la primera es la principal)
   * @throws RoutingError si algo falla
   *
   * Ejemplo de uso:
   * const routes = await routingService.getRoutes(
   *   [originWaypoint, destinationWaypoint],
   *   'driving',
   *   2 // Devuelve hasta 3 rutas (1 principal + 2 alternativas)
   * );
   */
  async getRoutes(
    waypoints: Waypoint[],
    travelMode: TravelMode,
    maxAlternatives: number = 2
  ): Promise<Route[]> {
    // Validación: necesitamos al menos 2 waypoints
    if (waypoints.length < 2) {
      throw this.createError(
        "INVALID_WAYPOINTS",
        "Se necesitan al menos 2 waypoints (origen y destino)"
      );
    }

    try {
      // 1. Construir la URL de la API con soporte para alternativas
      const url = this.buildOSRMUrl(waypoints, travelMode, maxAlternatives);

      console.log("🚗 Llamando a OSRM con alternativas:", url);

      // 2. Hacer la petición HTTP
      const response = await fetch(url);

      // 3. Verificar que la respuesta sea exitosa
      if (!response.ok) {
        throw this.createError(
          "NETWORK_ERROR",
          `Error en la petición: ${response.status} ${response.statusText}`
        );
      }

      // 4. Parsear la respuesta JSON
      const data: OSRMResponse = await response.json();

      // 5. Verificar que OSRM encontró al menos una ruta
      if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        throw this.createError(
          "NO_ROUTE",
          "No se encontró ninguna ruta entre los puntos especificados"
        );
      }

      // 6. Transformar TODAS las rutas de OSRM a nuestro formato
      const routes = data.routes.map((osrmRoute, index) =>
        this.transformOSRMRoute(osrmRoute, waypoints, travelMode, index)
      );

      console.log(
        `✅ ${routes.length} ruta(s) calculada(s):`,
        routes.map((r, i) => ({
          index: i,
          distance: r.distance,
          duration: r.duration,
          segments: r.segments.length,
        }))
      );

      return routes;
    } catch (error) {
      // Si es un RoutingError que ya creamos, lo lanzamos tal cual
      if (this.isRoutingError(error)) {
        throw error;
      }

      // Si es otro tipo de error, lo envolvemos
      console.error("❌ Error calculando rutas:", error);
      throw this.createError("API_ERROR", "Error al calcular las rutas", error);
    }
  }

  /**
   * buildOSRMUrl: Construye la URL para la API de OSRM
   *
   * @param waypoints - Array de waypoints
   * @param _travelMode - Modo de transporte (no se usa, siempre usamos 'car')
   * @param alternatives - Número de rutas alternativas a solicitar (por defecto 2)
   * @returns URL completa para hacer la petición
   *
   * Formato de la URL:
   * https://router.project-osrm.org/route/v1/car/lon1,lat1;lon2,lat2?...
   *
   * NOTA: Siempre usamos el servidor 'car' porque es el único disponible
   * públicamente. Los tiempos se ajustarán después según el modo.
   */
  private buildOSRMUrl(
    waypoints: Waypoint[],
    _travelMode: TravelMode,
    alternatives: number = 2
  ): string {
    // Siempre usar el servidor 'car'
    const baseUrl = OSRM_BASE_URL;

    // Convertir waypoints a formato "lon,lat;lon,lat;..."
    // ¡Importante! OSRM usa [longitud, latitud], pero nosotros usamos [lat, lon]
    const coordinates = waypoints
      .map((wp) => `${wp.coordinates[1]},${wp.coordinates[0]}`) // [lon,lat]
      .join(";");

    // Parámetros de la API
    const params = new URLSearchParams({
      overview: "full", // Queremos toda la geometría de la ruta
      geometries: "geojson", // Formato GeoJSON (más fácil de usar)
      steps: "true", // Queremos los pasos detallados
      annotations: "false", // No necesitamos anotaciones extra
      alternatives: alternatives.toString(), // 🆕 Pedir rutas alternativas (true o número)
      continue_straight: "default", // 🆕 Permitir giros en U si es necesario
    });

    return `${baseUrl}/${coordinates}?${params.toString()}`;
  }

  /**
   * transformOSRMRoute: Transforma la respuesta de OSRM a nuestro formato
   *
   * @param osrmRoute - Ruta en formato OSRM
   * @param waypoints - Waypoints originales
   * @param travelMode - Modo de transporte
   * @param alternativeIndex - Índice de la alternativa (0 = principal, 1+ = alternativas)
   * @returns Ruta en nuestro formato
   *
   * Esta función es el "traductor" entre el formato de OSRM y el nuestro.
   * IMPORTANTE: OSRM solo devuelve tiempos para 'car', así que para 'cycling'
   * y 'walking' calculamos los tiempos manualmente usando velocidades promedio.
   */
  private transformOSRMRoute(
    osrmRoute: OSRMRoute,
    waypoints: Waypoint[],
    travelMode: TravelMode,
    alternativeIndex: number = 0
  ): Route {
    // Extraer todos los segmentos de todas las "legs" (tramos entre waypoints)
    const segments: RouteSegment[] = [];
    let segmentIndex = 0;

    // OSRM organiza la ruta en "legs" (tramos entre cada par de waypoints)
    // Nosotros queremos todos los steps de todos los legs en un solo array
    osrmRoute.legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        // Para cycling y walking, recalculamos la duración basada en la distancia
        const duration =
          travelMode === "driving"
            ? step.duration
            : this.calculateDuration(step.distance, travelMode);

        segments.push({
          distance: step.distance,
          duration,
          instruction: this.buildInstruction(step),
          coordinates: this.convertCoordinates(step.geometry.coordinates),
          index: segmentIndex++,
        });
      });
    });

    // Convertir toda la geometría de la ruta
    // Esta es la línea completa que vamos a dibujar en el mapa
    const geometry = this.convertCoordinates(osrmRoute.geometry.coordinates);

    // Para cycling y walking, recalcular la duración total
    const totalDuration =
      travelMode === "driving"
        ? osrmRoute.duration
        : this.calculateDuration(osrmRoute.distance, travelMode);

    // Guardar los tiempos originales de OSRM para poder restaurarlos
    const osrmSegmentDurations = osrmRoute.legs.flatMap((leg) =>
      leg.steps.map((step) => step.duration)
    );

    // Crear la ruta en nuestro formato
    const route: Route = {
      id: crypto.randomUUID(),
      distance: osrmRoute.distance, // La distancia es la misma para todos los modos
      duration: totalDuration, // Pero la duración varía según el modo
      segments,
      geometry,
      travelMode,
      calculatedAt: new Date(),
      waypoints,
      osrmDuration: osrmRoute.duration, // Guardar tiempo original de OSRM
      osrmSegmentDurations, // Guardar tiempos de cada segmento
      alternativeIndex, // 🆕 Índice de alternativa (0 = principal, 1+ = alternativa)
      isSelected: alternativeIndex === 0, // 🆕 Por defecto, solo la principal está seleccionada
    };

    return route;
  }

  /**
   * recalculateRouteTimes: Recalcula los tiempos de una ruta existente
   *
   * @param route - Ruta existente a recalcular
   * @param newTravelMode - Nuevo modo de transporte
   * @returns Ruta con tiempos recalculados
   *
   * Este método NO llama a la API. Solo recalcula las duraciones:
   * - Para driving: usa los tiempos originales de OSRM (precisos)
   * - Para cycling/walking: calcula basándose en velocidades promedio
   */
  recalculateRouteTimes(route: Route, newTravelMode: TravelMode): Route {
    // Si el modo no cambió, devolver la ruta sin cambios
    if (route.travelMode === newTravelMode) {
      return route;
    }

    let totalDuration: number;
    let updatedSegments: RouteSegment[];

    if (newTravelMode === "driving") {
      // Para driving, restaurar los tiempos originales de OSRM
      totalDuration = route.osrmDuration || route.duration;
      updatedSegments = route.segments.map((segment, index) => ({
        ...segment,
        duration: route.osrmSegmentDurations?.[index] || segment.duration,
      }));
    } else {
      // Para cycling/walking, calcular basándose en la distancia
      totalDuration = this.calculateDuration(route.distance, newTravelMode);
      updatedSegments = route.segments.map((segment) => ({
        ...segment,
        duration: this.calculateDuration(segment.distance, newTravelMode),
      }));
    }

    // Crear nueva ruta con tiempos actualizados
    return {
      ...route,
      segments: updatedSegments,
      duration: totalDuration,
      travelMode: newTravelMode,
      calculatedAt: new Date(),
    };
  }

  /**
   * buildInstruction: Construye una instrucción legible
   *
   * @param step - Step de OSRM
   * @returns Instrucción en español
   *
   * Ejemplos:
   * - "Continúa por Calle Mayor"
   * - "Gira a la derecha en Plaza España"
   */
  private buildInstruction(step: OSRMStep): string {
    const streetName = step.name || "la carretera";
    const maneuverType = step.maneuver.type;

    // Mapeo de tipos de maniobra a texto en español
    const maneuverTexts: Record<string, string> = {
      depart: `Sal hacia ${streetName}`,
      arrive: `Llegarás a tu destino`,
      turn: `Gira en ${streetName}`,
      "new name": `Continúa por ${streetName}`,
      continue: `Continúa por ${streetName}`,
      merge: `Incorpórate a ${streetName}`,
      "on ramp": `Toma la rampa hacia ${streetName}`,
      "off ramp": `Sal por la rampa hacia ${streetName}`,
      fork: `En la bifurcación, toma ${streetName}`,
      roundabout: `En la rotonda, toma ${streetName}`,
      rotary: `En la rotonda, toma ${streetName}`,
    };

    return maneuverTexts[maneuverType] || `Continúa por ${streetName}`;
  }

  /**
   * convertCoordinates: Convierte coordenadas de OSRM a nuestro formato
   *
   * @param coords - Coordenadas en formato OSRM [lon, lat]
   * @returns Coordenadas en nuestro formato [lat, lon]
   *
   * ¡Importante! OSRM usa [longitud, latitud] pero Leaflet usa [lat, lon]
   */
  private convertCoordinates(coords: OSRMCoordinate[]): [number, number][] {
    return coords.map((coord) => [coord[1], coord[0]]); // [lat, lon]
  }

  /**
   * calculateDuration: Calcula la duración de un trayecto según el modo de transporte
   *
   * @param distanceMeters - Distancia en metros
   * @param travelMode - Modo de transporte
   * @returns Duración estimada en segundos
   *
   * Para 'driving', usamos la duración de OSRM (pasada como distanceMeters por simplicidad).
   * Para 'cycling' y 'walking', calculamos en base a velocidades promedio:
   * - Bicicleta: 15 km/h
   * - Andando: 5 km/h
   *
   * Fórmula: tiempo (segundos) = (distancia (km) / velocidad (km/h)) * 3600
   */
  private calculateDuration(
    distanceMeters: number,
    travelMode: TravelMode
  ): number {
    const distanceKm = distanceMeters / 1000;
    const speedKmh = AVERAGE_SPEEDS[travelMode];
    const durationHours = distanceKm / speedKmh;
    const durationSeconds = durationHours * 3600;
    return Math.round(durationSeconds);
  }

  /**
   * createError: Crea un error de routing
   *
   * @param code - Código del error
   * @param message - Mensaje descriptivo
   * @param details - Detalles adicionales
   * @returns RoutingError
   */
  private createError(
    code: RoutingError["code"],
    message: string,
    details?: any
  ): RoutingError {
    return {
      code,
      message,
      details,
    };
  }

  /**
   * isRoutingError: Verifica si un error es un RoutingError
   *
   * @param error - Error a verificar
   * @returns true si es un RoutingError
   */
  private isRoutingError(error: any): error is RoutingError {
    return (
      error &&
      typeof error.code === "string" &&
      typeof error.message === "string"
    );
  }
}

// ============================================
// EXPORTAR INSTANCIA ÚNICA (SINGLETON)
// ============================================

/**
 * Exportamos una única instancia del servicio.
 * Así todos los componentes usan la misma instancia.
 *
 * Esto se llama patrón "Singleton"
 */
export const routingService = new RoutingService();

/**
 * También exportamos la clase por si necesitamos crear
 * instancias personalizadas en el futuro (por ejemplo, para tests)
 */
export default RoutingService;
