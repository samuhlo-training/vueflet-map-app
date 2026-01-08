<div align="center">
  <br />
  <br />
  
  # <code>VUEFLET_MAP_APP</code>
  
  **MINIMAL VUE EXPERIMENT / MAP & ROUTING LAB**
  
  <br />

  <img src="https://img.shields.io/badge/VUE_3-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D" alt="Vue" />
  <img src="https://img.shields.io/badge/TYPESCRIPT-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PINIA-F5B13A?style=for-the-badge&logo=pinia&logoColor=white" alt="Pinia" />
  <img src="https://img.shields.io/badge/LEAFLET-199900?style=for-the-badge&logo=leaflet&logoColor=white" alt="Leaflet" />
  <img src="https://img.shields.io/badge/TAILWIND-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />

  <br />
  <br />
</div>

---

### 00 __ PREVIEW

![Vista previa de MapApp - Aplicación de mapas con búsqueda y rutas](assets/images/map-app-preview.webp)

> **ABSTRACT:** Aplicación de mapas interactivos con geolocalización, búsqueda de lugares mediante Nominatim API, cálculo de rutas optimizadas con OSRM y visualización mediante Leaflet. Implementa gestión de estado modular con Pinia y arquitectura basada en módulos Vue.
>
> <br />
>
> **ORIGIN:** Proyecto de aprendizaje personal para consolidar Vue 3 Composition API y Pinia.
> *Integración de APIs públicas (Nominatim, OSRM) y mapas open source.*
>
> <br />
>
> **DEMO:** [vueflet-map-app.vercel.app](https://vueflet-map-app.vercel.app/)

---

### 01 __ ARCHITECTURE & DECISIONS

| COMPONENT | TECH | NOTE |
| :--- | :--- | :--- |
| **Core** | `Vue 3 (Composition API)` | Script Setup syntax only. Modular architecture. |
| **State** | `Pinia` | Three stores: map, places, routing. Normalized state pattern. |
| **Maps** | `Leaflet` | OpenStreetMap tiles. Custom markers with reactive bindings. |
| **APIs** | `Nominatim / OSRM` | Nominatim for geocoding. OSRM for route calculation. |
| **Routing** | `Vue Router` | Lazy-loaded views. |
| **Styles** | `Tailwind CSS` | Utility-first approach for rapid UI development. |
| **Types** | `TypeScript` | Full type coverage with custom interfaces. |

<br>

### 02 __ INSTALLATION

*Run local environment:*

```bash
# 1. Clone
git clone https://github.com/samuhlo-training/vueflet-map-app.git

# 2. Install dependencies (pnpm enforced)
pnpm install

# 3. Ignite
pnpm dev
```

### 03 __ KEY FEATURES / SNIPPETS

Características destacadas de este experimento:

#### A. REACTIVE MAP STATE WITH PINIA

Store modular para gestionar el estado del mapa, lugares y rutas de forma independiente pero coordinada.

```typescript
// map.store.ts - Gestión centralizada del mapa
export const useMapStore = defineStore('map', () => {
  const map = ref<Map>();
  const markers = ref<Record<string, Marker>>({});
  const routePolyline = ref<Polyline>();

  const setUserLocation = (coords: [number, number]) => {
    userLocation.value = coords;
    if (!map.value) return;
    map.value.flyTo(coords, 13);
  };

  return { map, markers, routePolyline, setUserLocation };
});
```

#### B. MULTI-MODE ROUTING WITH OSRM

Implementación de cálculo de rutas con múltiples modos de transporte y alternativas.

```typescript
// routing.service.ts - Integración con OSRM API
export const getRoute = async (
  start: [number, number],
  end: [number, number],
  profile: TravelMode = 'car'
): Promise<Route> => {
  const url = `${OSRM_URL}/${profile}/${start[1]},${start[0]};${end[1]},${end[0]}`;
  const params = new URLSearchParams({
    overview: 'full',
    geometries: 'geojson',
    steps: 'true',
    alternatives: 'true'
  });
  
  const response = await fetch(`${url}?${params}`);
  const data = await response.json();
  return parseOSRMResponse(data);
};
```

#### C. NOMINATIM GEOCODING INTEGRATION

Búsqueda de lugares en tiempo real con debouncing y gestión de estados de carga.

```typescript
// usePlaceSearch.ts - Composable para búsqueda
export const usePlaceSearch = () => {
  const placesStore = usePlacesStore();
  
  const searchPlaces = async (query: string) => {
    if (query.length < 3) return;
    
    placesStore.setIsLoadingPlaces(true);
    const places = await searchLocation(query);
    placesStore.setPlaces(places);
    placesStore.setIsLoadingPlaces(false);
  };

  return { searchPlaces };
};
```

<div align="center">

<code>DESIGNED & CODED BY <a href='https://github.com/samuhlo'>samuhlo</a></code>

<small>Lugo, Galicia</small>

</div>
