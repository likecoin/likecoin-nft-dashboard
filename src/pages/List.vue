<template>
  <h2>NFT List</h2>
  <div>
    <button @click="onReset">
      Back to First page
    </button>
    <button @click="load">
      Load Next Page
    </button>
    <button @click="onReverseOrder">
      Reverse Order
    </button>
  </div>
  <table v-if="classes">
    <tr>
      <th>Name</th>
      <th>Creator</th>
      <th>NFT ID</th>
      <th>Description</th>
      <th>Sold Count</th>
      <th>Last Sold Price</th>
    </tr>
    <tr
      v-for="c in classes"
      :key="c.id"
    >
      <td>
        <NftLink
          :class-id="c.id"
          :name="c.name"
        />
      </td>
      <td>
        <UserLink
          :wallet="c.creator"
        />
      </td>
      <td>{{ c.parent.iscn_id_prefix }}<br>{{ c.id }}</td>
      <td>{{ c.description }}</td>
      <td>{{ c.soldCount }}</td>
      <td>{{ c.price }} LIKE</td>
    </tr>
  </table>
  <p v-else>
    No result
  </p>
</template>

<script setup>
import NftLink from '../components/NftLink.vue';
import UserLink from '../components/UserLink.vue';
</script>

<script>
import { getClass, indexerApi } from '../utils/proxy.js';

export default {
  name: 'NftList',
  data() {
    return {
      classes: [],
      nextKey: '',
      isReverse: true,
    };
  },
  async mounted() {
    await this.load();
  },
  methods: {
    onReset() {
      this.nextKey = '';
      this.load();
    },
    onReverseOrder() {
      this.isReverse = !this.isReverse;
      this.onReset();
    },
    async load() {
      const { data } = await indexerApi.get('/likechain/likenft/v1/class', {
        params: {
          reverse: this.isReverse,
          key: this.nextKey,
          limit: 100,
        },
      });
      if (data.pagination && data.pagination.next_key) {
        this.nextKey = data.pagination.next_key;
      }
      this.classes = data.classes;
      if (!this.classes) return;
      const promises = this.classes.map((c) => getClass(c.id)
        .then((res) => {
          const { data: { lastSoldPrice, metadata: { creatorWallet: creator, soldCount } } } = res;
          return {
            ...c,
            soldCount,
            price: lastSoldPrice,
            creator,
          };
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error(err);
          return {
            ...c,
            soldCount: 0,
            price: 0,
          };
        }));
      this.classes = await Promise.all(promises);
    },
  },
};
</script>
