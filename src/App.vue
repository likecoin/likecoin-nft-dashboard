<template>
  <div>
    <h1>NFT Ranking</h1>
    <div>
      <label>Begin: <input type="date" v-model="after"></label>
      <label>End: <input type="date" v-model="before"></label>
      <br>
      <label>Stakeholder Name: <input type="text" v-model="stakeholder"></label>
      <label>Type: <input type="text" v-model="type"></label>
      <br>
      <label>Creator: <input type="text" v-model="creator"></label>
      <label>Collector: <input type="text" v-model="collector"></label>
      <button v-on:click="load()">Search</button>
    </div>
    <table v-if="classes">
      <tr>
        <th>Name</th>
        <th>Creator</th>
        <th>Description</th>
        <th>Sold Count</th>
        <th>Last Sold Price</th>
      </tr>
      <tr v-for="c in classes.slice(0, 10)" :key="c.id">
        <td>{{ c.name }}</td>
        <td>{{ c.creator }}</td>
        <td>{{ c.description }}</td>
        <td>{{ c.sold_count }}</td>
        <td>{{ c.price }}</td>
      </tr>
    </table>
    <p v-else>No result</p>
  </div>
</template>

<script>
import axios from "axios";

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
        '/likechain/likenft/v1/ranking', {
          params: {
            ignore_list: 'like1yney2cqn5qdrlc50yr5l53898ufdhxafqz9gxp',
            after,
            before,
            stakeholder_name: this.stakeholder,
            creator: this.creator,
            collector: this.collector,
            type: this.type,
            limit: 20,
        },
      })
      this.classes = res.data.classes;
      if (!this.classes) return
      const promises = this.classes.map((c) => 
        axios.get(`https://api.rinkeby.like.co/likernft/purchase?iscn_id=${c.parent.iscn_id_prefix}&class_id=${c.id}`)
        .then((res) => {
          console.log(res.data);
          const { data: { lastSoldPrice, metadata: { creatorWallet: creator, soldCount } } } = res;
          return {
            ...c, 
            sold_count: soldCount, 
            price: lastSoldPrice,
            creator,
          };
        })
        .catch((err) => {
          console.error(err.message);
          return c;
        })
      );
      this.classes = (await Promise.all(promises)).sort((a, b) => b.price - a.price);
      console.log(this.classes);
    },
  }
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
</style>
