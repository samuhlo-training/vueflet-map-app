<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden">
   
    <main class="flex-1  flex justify-center items-center overflow-hidden z-1">
      <MapView />
    </main>
    <div class="z-999 right-3 bottom-3 fixed mb-4 mr-4 logo">
      <img :src="vueleaflet" alt="Vue Logo" class="h-16" />
    </div>
  </div>
</template>

<script setup lang="ts">


import vueleaflet from '@/assets/vueleaflet.svg'
import MapView from '@/modules/map/views/MapView.vue';

</script>
 