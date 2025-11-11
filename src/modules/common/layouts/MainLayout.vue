<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden">
    <header class="text-center my-4 shrink-0">
      <h1 class="text-3xl font-bold">Vue<span class="text-green-600"> + </span>Leaflet</h1>
    </header>
    <main class="flex-1 px-10 pb-23  flex justify-center items-center overflow-hidden z-10">
      <MapView />
    </main>
    <div class="z-999 right-0 bottom-0 fixed mb-4 mr-4 logo">
      <img :src="vueleaflet" alt="Vue Logo" class="h-16" />
    </div>
  </div>
</template>

<script setup lang="ts">


import vueleaflet from '@/assets/vueleaflet.svg'
import MapView from '@/modules/map/views/MapView.vue';

</script>
 