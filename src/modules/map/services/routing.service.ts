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
 * URLs base para cada modo de transporte en OSRM
 *
 * OSRM tiene servidores públicos gratuitos para cada modo:
 * - car: Para coches
 * - bike: Para bicicletas
 * - foot: Para caminar
 */
const OSRM_BASE_URLS: Record<TravelMode, string> = {
  driving: "https://router.project-osrm.org/route/v1/car",
  cycling: "https://router.project-osrm.org/route/v1/bike",
  walking: "https://router.project-osrm.org/route/v1/foot",
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
   */
  async getRoute(
    waypoints: Waypoint[],
    travelMode: TravelMode
  ): Promise<Route> {
    // Validación: necesitamos al menos 2 waypoints
    if (waypoints.length < 2) {
      throw this.createError(
        "INVALID_WAYPOINTS",
        "Se necesitan al menos 2 waypoints (origen y destino)"
      );
    }

    try {
      // 1. Construir la URL de la API
      const url = this.buildOSRMUrl(waypoints, travelMode);

      console.log("🚗 Llamando a OSRM:", url);

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

      // 5. Verificar que OSRM encontró una ruta
      if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        throw this.createError(
          "NO_ROUTE",
          "No se encontró ninguna ruta entre los puntos especificados"
        );
      }

      // Obtener la primera ruta
      const osrmRoute = data.routes[0];
      if (!osrmRoute) {
        throw this.createError(
          "NO_ROUTE",
          "No se encontró ninguna ruta entre los puntos especificados"
        );
      }

      // 6. Transformar la respuesta de OSRM a nuestro formato
      const route = this.transformOSRMRoute(osrmRoute, waypoints, travelMode);

      console.log("✅ Ruta calculada:", {
        distance: route.distance,
        duration: route.duration,
        segments: route.segments.length,
      });

      return route;
    } catch (error) {
      // Si es un RoutingError que ya creamos, lo lanzamos tal cual
      if (this.isRoutingError(error)) {
        throw error;
      }

      // Si es otro tipo de error, lo envolvemos
      console.error("❌ Error calculando ruta:", error);
      throw this.createError("API_ERROR", "Error al calcular la ruta", error);
    }
  }

  /**
   * buildOSRMUrl: Construye la URL para la API de OSRM
   *
   * @param waypoints - Array de waypoints
   * @param travelMode - Modo de transporte
   * @returns URL completa para hacer la petición
   *
   * Formato de la URL:
   * https://router.project-osrm.org/route/v1/car/lon1,lat1;lon2,lat2?...
   */
  private buildOSRMUrl(waypoints: Waypoint[], travelMode: TravelMode): string {
    const baseUrl = OSRM_BASE_URLS[travelMode];

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
    });

    return `${baseUrl}/${coordinates}?${params.toString()}`;
  }

  /**
   * transformOSRMRoute: Transforma la respuesta de OSRM a nuestro formato
   *
   * @param osrmRoute - Ruta en formato OSRM
   * @param waypoints - Waypoints originales
   * @param travelMode - Modo de transporte
   * @returns Ruta en nuestro formato
   *
   * Esta función es el "traductor" entre el formato de OSRM y el nuestro
   */
  private transformOSRMRoute(
    osrmRoute: OSRMRoute,
    waypoints: Waypoint[],
    travelMode: TravelMode
  ): Route {
    // Extraer todos los segmentos de todas las "legs" (tramos entre waypoints)
    const segments: RouteSegment[] = [];
    let segmentIndex = 0;

    // OSRM organiza la ruta en "legs" (tramos entre cada par de waypoints)
    // Nosotros queremos todos los steps de todos los legs en un solo array
    osrmRoute.legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        segments.push({
          distance: step.distance,
          duration: step.duration,
          instruction: this.buildInstruction(step),
          coordinates: this.convertCoordinates(step.geometry.coordinates),
          index: segmentIndex++,
        });
      });
    });

    // Convertir toda la geometría de la ruta
    // Esta es la línea completa que vamos a dibujar en el mapa
    const geometry = this.convertCoordinates(osrmRoute.geometry.coordinates);

    // Crear la ruta en nuestro formato
    const route: Route = {
      id: crypto.randomUUID(),
      distance: osrmRoute.distance,
      duration: osrmRoute.duration,
      segments,
      geometry,
      travelMode,
      calculatedAt: new Date(),
      waypoints,
    };

    return route;
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
