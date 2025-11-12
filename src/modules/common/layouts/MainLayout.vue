<!--
  MAIN LAYOUT - LAYOUT PRINCIPAL DE LA APLICACIÓN

  Layout principal que estructura la aplicación completa:
  - Contenedor a pantalla completa
  - Área principal con el MapView
  - Logo fijo en la esquina inferior derecha
  - Diseño responsive y centrado
-->
<template>
  <!-- Contenedor principal a pantalla completa -->
  <div class="h-screen w-screen flex flex-col overflow-hidden">

    <!-- Área principal con el mapa -->
    <main class="flex-1  flex justify-center items-center overflow-hidden z-1">
      <MapView />
    </main>

    <!-- Logo fijo en esquina inferior derecha -->
    <div class="z-999 right-3 bottom-3 fixed mb-4 mr-4 logo">
      <img :src="vueleaflet" alt="Vue Logo" class="h-16" />
    </div>
  </div>
</template>

<script setup lang="ts">
// ============================================
// IMPORTACIONES
// ============================================

/** Logo de Vue + Leaflet */
import vueleaflet from '@/assets/vueleaflet.svg'

/** Vista principal del mapa */
import MapView from '@/modules/map/views/MapView.vue';

</script>

<style scoped>
  
.logo {
  pointer-events: auto;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>


