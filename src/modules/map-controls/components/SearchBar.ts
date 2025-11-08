import { ref } from "vue";
import { searchResults } from "./SearchResults";
import type { Place } from "@/modules/map/interfaces/place.interfaces";

export const useSearchBar = () => {
  const debounceTimer = ref<number | undefined>(undefined);
  const searchQuery = ref("");
  const searchResults = ref<Place[]>([]);

  /**
   * Maneja el evento de input con debounce
   * Espera 500ms de inactividad antes de ejecutar la búsqueda
   */

  const handleSearch = (event: Event) => {
    const input = event.target as HTMLInputElement;
    searchQuery.value = input.value;

    // Paso 1: Cancelar el temporizador anterior si existe
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer.value);
    }

    // Paso 2: Crear un nuevo temporizador
    debounceTimer.value = window.setTimeout(() => {
      // Paso 3: Ejecutar la búsqueda después de 500ms de inactividad
      console.log("Ejecutando búsqueda con:", searchQuery.value);
      searchInput();
      debounceTimer.value = undefined;
    }, 500); // 500ms de espera
  };

  const searchInput = async () => {
    console.log("Buscando ubicación para:", searchQuery.value);
    // Lógica para buscar la ubicación
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          `format=json&q=${encodeURIComponent(searchQuery.value)}&limit=5`
      );
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error al buscar la ubicación:", error);
      throw new Error("Error al buscar la ubicación");
    }
  };

  return {
    //State
    searchQuery,

    //Getters

    //Actions
    handleSearch,
  };
};
