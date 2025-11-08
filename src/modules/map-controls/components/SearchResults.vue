<template>
  <ul class="mt-3 max-h-80 overflow-y-auto rounded-lg border border-[#e5e7eb]">
    <li class="cursor-pointer border-b border-[#f3f4f6] px-4 py-3 transition-all duration-200 hover:bg-[#f0fdf4] hover:border-b-[#42b983]">
      <h5 class="font-semibold text-[#1f2937] text-sm mb-1">Nombre del lugar</h5>
      <p class="text-[#6b7280] text-xs mb-3">Dirección o descripción del lugar</p>
      <div class="flex justify-end">
        <button class="px-3 py-1.5 text-xs font-medium text-white bg-linear-to-r from-[#42b983] to-[#35495E] rounded hover:shadow-lg hover:from-[#35a372] hover:to-[#2d3d4d] transition-all duration-200">
          Direcciones
        </button>
      </div>
    </li>
    <li class="cursor-pointer border-b border-[#f3f4f6] px-4 py-3 transition-all duration-200 hover:bg-[#f0fdf4] hover:border-b-[#42b983]">
      <h5 class="font-semibold text-[#1f2937] text-sm mb-1">Nombre del lugar</h5>
      <p class="text-[#6b7280] text-xs mb-3">Dirección o descripción del lugar</p>
      <div class="flex justify-end">
        <button class="px-3 py-1.5 text-xs font-medium text-white bg-linear-to-r from-[#42b983] to-[#35495E] rounded hover:shadow-lg hover:from-[#35a372] hover:to-[#2d3d4d] transition-all duration-200">
          Direcciones
        </button>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { searchResults } from './SearchResults.ts';
</script>
