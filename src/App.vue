<template>
  <header class="main-header">
    <h1 class="gradient-text">
      LikeCoin NFT Dashboard
    </h1>
  </header>
  <div style="margin: 10px">
    <div>
      <span
        v-for="(route, i) of routes"
        :key="route.name"
      >
        <button @click="selectPage(i)">{{ route.displayName }}</button>
      </span>
    </div>
    <div class="page-container">
      <router-view />
    </div>
  </div>
  <footer>
    <a href="https://liker.land">Writing NFT</a>
    <a href="https://likecoin.github.io/likecoin-nft-marketplace/">NFT Marketplace</a>
    <a href="https://github.com/likecoin/likecoin-nft-dashboard">Github</a>
    <a href="https://like.co">About LikeCoin</a>
  </footer>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { routes } from './router';

const router = useRouter();

function selectPage(n) {
  const route = routes[n];
  router.push(route.path);
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  border: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
}

header {
  background-color: #28646e;
  width: 100%;
  height: 100px;
  margin: 0;
}

.main-header {
  display: flex;
  justify-content: center;
  align-items: center;
}

.gradient-text {
  margin: 0;
  color: transparent;
  font-weight: 600;
  font-size: 36px;
  background-clip: text;
  -webkit-background-clip: text;
  --tw-gradient-to: #f0e6b4;
  --tw-gradient-from: #d2f0f0;
  --tw-gradient-stops: var(--tw-gradient-from),
    var(--tw-gradient-to, rgba(210, 240, 240, 0));
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

table {
  width: 100%;
  border-collapse: collapse;
}
table, th, td {
  border: 1px solid;
}

footer {
  margin: 10px;
}

footer a {
  margin-left: 10px;
}
</style>
