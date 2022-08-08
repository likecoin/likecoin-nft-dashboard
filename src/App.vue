<template>
  <h1>LikeCoin NFT Dashboard</h1>
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
  const route = routes[n];
  router.push(route.path);
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
table, th, td {
  border: 1px solid;
}
</style>
