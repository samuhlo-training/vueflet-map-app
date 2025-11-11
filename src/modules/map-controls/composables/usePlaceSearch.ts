import { ref, computed } from "vue";
import { usePlacesStore } from "@/modules/map/stores/places.store";

/**
 * Composable reutilizable para búsqueda de lugares con debounce
 *
 * Características:
 * - Debounce configurable para evitar búsquedas excesivas
 * - Control de estado de búsqueda (isSearching)
 * - Manejo de resultados filtrados
 * - Gestión automática de timers
 *
 * @param options - Opciones de configuración
 * @param options.debounceMs - Tiempo de debounce en milisegundos (default: 300)
 * @param options.maxResults - Número máximo de resultados a mostrar (default: 5)
 */
export const usePlaceSearch = (options?: {
  debounceMs?: number;
  maxResults?: number;
}) => {
  const { debounceMs = 300, maxResults = 5 } = options || {};

  const placesStore = usePlacesStore();
  const searchQuery = ref("");
  const isSearching = ref(false);

  let searchTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Resultados de búsqueda filtrados
   */
  const filteredResults = computed(() => {
    return placesStore.searchResults.slice(0, maxResults);
  });

  /**
   * Ejecuta la búsqueda con debounce
   * @param query - Texto a buscar
   */
  const search = async (query: string) => {
    searchQuery.value = query;

    // Limpiar timer anterior
    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    // Si el query está vacío, no buscar
    if (!query.trim()) {
      isSearching.value = false;
      return;
    }

    // Buscar después del debounce
    isSearching.value = true;

    searchTimer = setTimeout(async () => {
      await placesStore.searchPlaces(query);
      isSearching.value = false;
    }, debounceMs);
  };

  /**
   * Maneja el evento de input (útil para v-model o @input)
   */
  const handleSearchInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    search(input.value);
  };

  /**
   * Limpia la búsqueda y cancela cualquier timer pendiente
   */
  const clearSearch = () => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
    searchQuery.value = "";
    isSearching.value = false;
  };

  return {
    // State
    searchQuery,
    isSearching,

    // Getters
    filteredResults,

    // Actions
    search,
    handleSearchInput,
    clearSearch,
  };
};
