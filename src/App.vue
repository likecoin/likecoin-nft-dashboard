<template>
  <div>
    <h1>NFT Ranking</h1>
    <table>
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
    {{ classes }}
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'App',
  data () {
    return {
      classes: [],
    };
  },
  async mounted () {
    const res = await axios.get('/likechain/likenft/v1/ranking?ignore_list=like1yney2cqn5qdrlc50yr5l53898ufdhxafqz9gxp&limit=20');
    this.classes = res.data.classes;
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
