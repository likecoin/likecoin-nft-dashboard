<template>
  <h2>Top NFT Collectors</h2>
  <table>
    <tr>
      <th>Address</th>
      <th>Count</th>
    </tr>
    <tr
      v-for="owner in owners"
      :key="owner.owner"
    >
      <td>
        <UserLink
          :wallet="owner.owner"
        />
      </td>
      <td>{{ owner.count }}</td>
    </tr>
  </table>
</template>

<script setup>
import UserLink from '../components/UserLink.vue';
</script>

<script>
import { indexerApi } from '../utils/proxy.js';

const limit = 20;

export default {
  name: 'TopCollectors',
  data() {
    return {
      owners: [],
    };
  },
  mounted() {
    indexerApi.get('/statistics/nft/owners', { params: { limit } }).then((res) => {
      this.owners = res.data.owners;
    });
  },
};
</script>
