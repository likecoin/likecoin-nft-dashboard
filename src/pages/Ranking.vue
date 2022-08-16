<template>
  <h2>Ranking</h2>
  <div>
    <label>Begin: <input
      v-model="after"
      type="date"
    ></label>
    <label>End: <input
      v-model="before"
      type="date"
    ></label>
    <br>
    <label>Stakeholder Name: <input
      v-model="stakeholder"
      type="text"
    ></label>
    <label>Type: <input
      v-model="type"
      type="text"
    ></label>
    <br>
    <label>Creator: <input
      v-model="creator"
      type="text"
    ></label>
    <label>Collector: <input
      v-model="collector"
      type="text"
    ></label>
    <button @click="load">
      Search
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
      v-for="c in classes.slice(0, 10)"
      :key="c.id"
    >
      <td>{{ c.name }}</td>
      <td>{{ c.creator }}</td>
      <td>{{ c.parent.iscn_id_prefix }}<br>{{ c.id }}</td>
      <td>{{ c.description }}</td>
      <td>{{ c.soldCount }}</td>
      <td>{{ c.price }}</td>
    </tr>
  </table>
  <p v-else>
    No result
  </p>
</template>

<script>
import axios from 'axios';
import {
  INDEXER_URL, IGNORE_ADDRESS_LIST,
} from '../config';
import { getClass } from '../utils/proxy.js';

export default {
  name: 'NftRanking',
  data() {
    return {
      classes: [],
      after: '',
      before: '',
      stakeholder: '',
      creator: '',
      collector: '',
      type: '',
    };
  },
  async mounted() {
    await this.load();
  },
  methods: {
    async load() {
      const after = new Date(this.after).getTime() / 1000 || 0;
      const before = new Date(this.before).getTime() / 1000 || 0;
      const res = await axios.get(`${INDEXER_URL}/likechain/likenft/v1/ranking`, {
        params: {
          ignore_list: IGNORE_ADDRESS_LIST,
          after,
          before,
          stakeholder_name: this.stakeholder,
          creator: this.creator,
          collector: this.collector,
          type: this.type,
          limit: 15,
        },
      });
      this.classes = res.data.classes;
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
          console.error(err);
          return {
            ...c,
            soldCount: 0,
            price: 0,
          };
        }));
      this.classes = (await Promise.all(promises)).sort((a, b) => b.soldCount - a.soldCount);
    },
  },
};
</script>
