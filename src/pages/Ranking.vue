<template>
  <h2>Ranking</h2>
  <div>
    <label>Begin: <input type="date" v-model="after"></label>
    <label>End: <input type="date" v-model="before"></label>
    <br>
    <label>Stakeholder Name: <input type="text" v-model="stakeholder"></label>
    <label>Type: <input type="text" v-model="type"></label>
    <br>
    <label>Creator: <input type="text" v-model="creator"></label>
    <label>Collector: <input type="text" v-model="collector"></label>
    <button @click="load">Search</button>
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
    <tr v-for="c in classes.slice(0, 10)" :key="c.id">
      <td>{{ c.name }}</td>
      <td>{{ c.creator }}</td>
      <td>{{ c.parent.iscn_id_prefix }}<br>{{ c.id }}</td>
      <td>{{ c.description }}</td>
      <td>{{ c.soldCount }}</td>
      <td>{{ c.price }}</td>
    </tr>
  </table>
  <p v-else>No result</p>
</template>

<script >
import axios from "axios";
import {
  INDEXER, API_PUBLIC, IGNORE_LIST,
} from '../config';

export default {
  name: 'App',
  watch: {
  },
  data () {
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
      const res = await axios.get(
        `${INDEXER}/likechain/likenft/v1/ranking`, {
          params: {
            ignore_list: IGNORE_LIST,
            after,
            before,
            stakeholder_name: this.stakeholder,
            creator: this.creator,
            collector: this.collector,
            type: this.type,
            limit: 15,
        },
      })
      this.classes = res.data.classes;
      if (!this.classes) return
      const promises = this.classes.map((c) => 
        axios.get(`${API_PUBLIC}/likernft/purchase`, {
          params: {
            class_id: c.id,
          }
        })
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
          console.error(err.message);
          return {
            ...c, 
            soldCount: 0, 
            price: 0,
          };
        })
      );
      this.classes = (await Promise.all(promises)).sort((a, b) => b.sold_count - a.sold_count);
    },
  }
}
</script>
