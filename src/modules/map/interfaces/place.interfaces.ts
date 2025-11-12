/**
 * INTERFACES DE LUGARES
 *
 * Este archivo define los tipos de datos para los lugares
 * obtenidos de la API de Nominatim y procesados por la aplicación.
 */

// ============================================
// INTERFACES
// ============================================

/**
 * Place: Representa un lugar obtenido de Nominatim
 *
 * Esta interfaz combina los datos crudos de la API de Nominatim
 * con propiedades adicionales agregadas por la aplicación.
 *
 * Ejemplo:
 * {
 *   place_id: 12345,
 *   name: "Plaza Mayor",
 *   display_name: "Plaza Mayor, Madrid, España",
 *   coordinates: [40.4168, -3.7038],
 *   // ... otras propiedades
 * }
 */
export interface Place {
  /** Tipo de dirección (ej: "place", "highway") */
  addresstype: string;

  /** Caja delimitadora [lat_min, lat_max, lon_min, lon_max] */
  boundingbox: [string, string, string, string];

  /** Clase del objeto OSM */
  class: string;

  /** Nombre completo para mostrar al usuario */
  display_name: string;

  /** Importancia del lugar (0-1, más alto = más importante) */
  importance: number;

  /** Latitud como string (de la API de Nominatim) */
  lat: string;

  /** Licencia de los datos */
  licence: string;

  /** Longitud como string (de la API de Nominatim) */
  lon: string;

  /** Nombre corto del lugar */
  name: string;

  /** ID del objeto en OpenStreetMap */
  osm_id: number;

  /** Tipo del objeto OSM */
  osm_type: string;

  /** ID único del lugar en Nominatim */
  place_id: number;

  /** Ranking del lugar en Nominatim */
  place_rank: number;

  /** Tipo específico del lugar */
  type: string;

  // ============================================
  // PROPIEDADES AGREGADAS POR LA APLICACIÓN
  // ============================================

  /** ID único generado por la aplicación */
  id: number;

  /** Coordenadas como array de números [lat, lon] */
  coordinates: [number, number];
}
