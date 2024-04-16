<script lang="ts" setup>
import TextConversion from './components/TextConversion.vue';
</script>

<template>
  <div class="absolute top-0 left-0 flex items-start flex-nowrap">
    <a href="https://vitejs.dev" target="_blank">
      <img alt="Vite logo" class="logo" src="/vite.svg" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img alt="Vue logo" class="logo vue" src="./assets/vue.svg" />
    </a>
  </div>
  <TextConversion />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
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
