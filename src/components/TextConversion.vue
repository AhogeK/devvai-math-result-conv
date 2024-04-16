<script lang="ts" setup>
import { ref } from 'vue';

const textareaStyle = ref([
  'w-full',
  'h-full',
  'p-2',
  'resize-none',
  'col-span-4',
  'responsive-grid-item',
  'rounded-lg',
]);
</script>

<template>
  <div class="w-full h-1/2 responsive-h">
    <div class="grid grid-cols-11 h-full responsive-grid">
      <div />
      <textarea
        :class="textareaStyle"
        placeholder="Enter any text..."
      ></textarea>
      <div />
      <textarea :class="textareaStyle" readonly></textarea>
      <div />
    </div>
  </div>
</template>

<style>
@media (max-width: 800px) {
  .responsive-h {
    height: 100%;
  }

  .responsive-grid {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 3fr 1fr 3fr 1fr;
  }
}

textarea[readonly] {
  user-select: none;
  cursor: default;
  outline: none;
}
</style>