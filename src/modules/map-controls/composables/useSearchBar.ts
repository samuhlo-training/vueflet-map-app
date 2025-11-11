import { ref } from "vue";
import { usePlacesStore } from "@/modules/map/stores/places.store";

export const useSearchBar = () => {
  const debounceTimer = ref<number | undefined>(undefined);
  const searchQuery = ref("");
  const placesStore = usePlacesStore();

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
      placesStore.searchPlaces(searchQuery.value);
      debounceTimer.value = undefined;
    }, 500); // 500ms de espera
  };

  return {
    //State

    //Getters

    //Actions
    handleSearch,
  };
};
