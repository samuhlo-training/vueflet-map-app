<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden">
    <header class="text-center py-3 shrink-0">
      <h1 class="text-3xl font-bold">Vue<span class="text-green-600"> + </span>Leaflet</h1>
    </header>
    <main class="flex-1 p-27 flex justify-center items-center overflow-hidden">
      <MapView />
    </main>
    <div class="z-999 right-0 bottom-0 fixed mb-4 mr-4 logo">
      <img :src="vueLogo" alt="Vue Logo" class="h-16" />
    </div>
  </div>
</template>

<script setup lang="ts">

import vueLogo from '@/assets/vue.svg'
import MapView from '@/modules/map/views/MapView.vue';

</script>
 