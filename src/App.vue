<template>
  <h1>Writing NFT Toolbox</h1>
  <div>
    <div>Select a page</div>
    <div>
      <span v-for="(route, i) of routes" :key="i">
        <button @click="selectPage(i)">{{ route.name }}</button>
      </span>
    </div>
    <div class="page-container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { routes } from '@/router';
const router = useRouter();

function selectPage(n) {
  console.log(n);
  const route = routes[n];
  router.push(route.path);
}
</script>

<style scoped>
.page-container {
  border: 2px solid;
  min-height: 500px;
}
</style>
