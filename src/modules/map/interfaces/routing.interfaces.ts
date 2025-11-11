/**
 * INTERFACES DE ROUTING
 *
 * Este archivo define todos los tipos de datos que vamos a usar
 * para el sistema de direcciones (routing).
 */

// ============================================
// TIPOS BÁSICOS
// ============================================

/**
 * TravelMode: Los modos de transporte disponibles
 * - driving: En coche
 * - cycling: En bicicleta
 * - walking: A pie / Caminando
 */
export type TravelMode = "driving" | "cycling" | "walking";

/**
 * RoutePreference: Preferencias para calcular la ruta
 * - fastest: La ruta más rápida (menos tiempo)
 * - shortest: La ruta más corta (menos distancia)
 * - balanced: Balance entre tiempo y distancia
 */
export type RoutePreference = "fastest" | "shortest" | "balanced";

/**
 * UIMode: El modo de la interfaz de usuario
 * - search: Modo de búsqueda normal (el que ya tienes)
 * - directions: Modo de direcciones (el nuevo que vamos a crear)
 */
export type UIMode = "search" | "directions";

/**
 * WaypointType: El tipo de punto en la ruta
 * - origin: Punto de origen (donde empiezas)
 * - destination: Punto de destino (donde terminas)
 * - waypoint: Punto intermedio (parada en el camino)
 */
export type WaypointType = "origin" | "destination" | "waypoint";

// ============================================
// INTERFACES
// ============================================

/**
 * Waypoint: Representa un punto en la ruta
 *
 * Ejemplo:
 * {
 *   id: '1',
 *   name: 'Plaza Mayor, Madrid',
 *   coordinates: [40.4168, -3.7038],
 *   type: 'origin',
 *   order: 0
 * }
 */
export interface Waypoint {
  /** ID único del waypoint (podemos usar crypto.randomUUID()) */
  id: string;

  /** Nombre descriptivo del lugar */
  name: string;

  /** Coordenadas [latitud, longitud] */
  coordinates: [number, number];

  /** Tipo de waypoint: origen, destino o parada intermedia */
  type: WaypointType;

  /** Orden en la ruta (0 = primero, 1 = segundo, etc.) */
  order: number;

  /** ID del lugar de Nominatim (opcional, para mantener referencia) */
  placeId?: number;
}

/**
 * RouteSegment: Representa un tramo de la ruta
 *
 * Una ruta completa está compuesta de varios segmentos.
 * Por ejemplo, "Gira a la derecha en Calle X" es un segmento.
 */
export interface RouteSegment {
  /** Distancia del segmento en metros */
  distance: number;

  /** Duración del segmento en segundos */
  duration: number;

  /** Instrucción de navegación (ej: "Gira a la derecha") */
  instruction: string;

  /** Coordenadas que forman este segmento de la ruta */
  coordinates: [number, number][];

  /** Índice del segmento en la ruta */
  index: number;
}

/**
 * Route: Representa una ruta completa calculada
 *
 * Esta es la información que nos devuelve la API de routing
 * después de calcular la ruta entre varios puntos.
 */
export interface Route {
  /** ID único de la ruta */
  id: string;

  /** Distancia total de la ruta en metros */
  distance: number;

  /** Duración total de la ruta en segundos */
  duration: number;

  /** Array de segmentos que componen la ruta */
  segments: RouteSegment[];

  /** Todas las coordenadas de la ruta (para dibujar en el mapa) */
  geometry: [number, number][];

  /** Modo de transporte usado para calcular esta ruta */
  travelMode: TravelMode;

  /** Timestamp de cuándo se calculó la ruta */
  calculatedAt: Date;

  /** Array de waypoints usados para calcular esta ruta */
  waypoints: Waypoint[];

  /**
   * Duración original de OSRM para driving (opcional)
   * Se guarda para poder volver a los tiempos precisos de OSRM
   * cuando se cambia de cycling/walking de vuelta a driving
   */
  osrmDuration?: number;

  /**
   * Duraciones originales de OSRM para cada segmento (opcional)
   * Se guardan para mantener los tiempos precisos de driving
   */
  osrmSegmentDurations?: number[];

  /**
   * Índice de la ruta alternativa (opcional)
   * - undefined o 0: Ruta principal (la más rápida)
   * - 1, 2: Rutas alternativas
   */
  alternativeIndex?: number;

  /**
   * Indica si esta ruta está seleccionada por el usuario
   * Por defecto, la ruta principal (índice 0) está seleccionada
   */
  isSelected?: boolean;
}

/**
 * RoutingError: Errores que pueden ocurrir al calcular rutas
 */
export interface RoutingError {
  /** Código del error */
  code: "NO_ROUTE" | "NETWORK_ERROR" | "INVALID_WAYPOINTS" | "API_ERROR";

  /** Mensaje descriptivo del error */
  message: string;

  /** Detalles adicionales (opcional) */
  details?: any;
}

/**
 * RoutingOptions: Opciones para calcular una ruta
 *
 * Estas opciones se pueden expandir en el futuro para añadir
 * más funcionalidades como evitar autopistas, peajes, etc.
 */
export interface RoutingOptions {
  /** Modo de transporte */
  travelMode: TravelMode;

  /** Preferencia de ruta */
  preference?: RoutePreference;

  /** Evitar autopistas (futuro) */
  avoidHighways?: boolean;

  /** Evitar peajes (futuro) */
  avoidTolls?: boolean;
}
