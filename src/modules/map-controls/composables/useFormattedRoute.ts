// src/modules/map/composables/useFormattedRoute.ts

import { computed } from "vue";
import type { Ref } from "vue";
import type { Route } from "@/modules/map/interfaces/routing.interfaces";

// El composable recibe la prop 'route' como una Ref.
// Esto es para que cuando la prop cambie, los 'computed' también cambien.
export function useFormattedRoute(route: Ref<Route | null>) {
  // --- 1. UTILS GENÉRICAS
  // Las ponemos aquí. Ahora son "ayudantes" privados de este composable.
  // Pero también las devolveremos por si el componente las necesita (como en tu v-for).

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)} seg`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  // --- 2. PROPIEDADES COMPUTADAS
  // Ahora dependen de 'route.value' en lugar de 'props.route'.

  const formattedDistance = computed(() => {
    if (!route.value) return "";
    // Usamos nuestra propia función ayudante
    return formatDistance(route.value.distance);
  });

  const formattedDuration = computed(() => {
    if (!route.value) return "";
    const seconds = route.value.duration;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  });

  const travelModeText = computed((): string => {
    if (!route.value) return "";
    const modeTexts = {
      driving: "En coche",
      cycling: "En bicicleta",
      walking: "A pie",
    };
    return modeTexts[route.value.travelMode] || "";
  });

  const calculatedAtText = computed((): string => {
    if (!route.value) return "";
    const date = new Date(route.value.calculatedAt);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - date.getTime()) / 1000 / 60
    );

    if (diffMinutes < 1) return "hace un momento";
    if (diffMinutes < 60)
      return `hace ${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""}`;

    const hours = Math.floor(diffMinutes / 60);
    return `hace ${hours} hora${hours > 1 ? "s" : ""}`;
  });

  // --- 3. LO QUE DEVOLVEMOS ---
  // Devolvemos todo lo que el componente necesita usar.
  return {
    // Las propiedades computadas para el resumen
    formattedDistance,
    formattedDuration,
    travelModeText,
    calculatedAtText,

    // Las funciones genéricas para el v-for de instrucciones
    formatDistance,
    formatDuration,
  };
}
