<template>
    <MapView />
<div class=" right-0 bottom-0 fixed mb-4 mr-4 logo">
  <img :src="vueLogo" alt="Vue Logo" class="h-16" />
</div>
</template>

<script setup lang="ts">

import vueLogo from '../../../assets/vue.svg'
import MapView from '../../map/views/MapView.vue';

</script>
 