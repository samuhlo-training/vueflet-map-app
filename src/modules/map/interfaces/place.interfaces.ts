export interface Place {
  addresstype: string;
  boundingbox: [string, string, string, string]; // [lat_min, lat_max, lon_min, lon_max]
  class: string;
  display_name: string;
  importance: number;
  lat: string; // Nota: La API lo devuelve como string
  licence: string;
  lon: string; // Nota: La API lo devuelve como string
  name: string;
  osm_id: number;
  osm_type: string;
  place_id: number;
  place_rank: number;
  type: string;
  // Propiedades agregadas por el store
  id: number;
  coordinates: [number, number];
}
