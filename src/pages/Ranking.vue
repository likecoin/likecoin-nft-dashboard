<template>
  <h2>Trending NFT</h2>
  <div>
    <button @click="setRecentDateRange(7)">
      7 days
    </button>
    <button @click="setRecentDateRange(14)">
      14 days
    </button>
    <button @click="setRecentDateRange(30)">
      30 days
    </button>
    <button @click="setRecentDateRange(0)">
      All time
    </button>
  </div>
  <br>
  <div v-if="!showFilter">
    <button @click="showFilter = !showFilter">
      Show Filter
    </button>
  </div>
  <div v-else>
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
  <div v-if="isLoading">
    Loading...
  </div>
  <table v-else-if="classes">
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
import {
  IGNORE_ADDRESS_LIST,
} from '../config';
import { getClass, indexerApi } from '../utils/proxy.js';

export default {
  name: 'NftRanking',
  data() {
    return {
      isLoading: false,
      showFilter: false,
      classes: [],
      after: '2022-07-01',
      before: this.getDateString(new Date()),
      stakeholder: '',
      creator: '',
      collector: '',
      type: '',
    };
  },
  async mounted() {
    this.setRecentDateRange(7);
    await this.load();
  },
  methods: {
    getDateString(date) {
      return date.toISOString().split('T')[0];
    },
    setRecentDateRange(recent) {
      const now = new Date();
      this.before = this.getDateString(now);
      if (recent) {
        const date = new Date();
        date.setDate(now.getDate() - recent);
        this.after = this.getDateString(date);
      } else {
        this.after = '2022-07-01';
      }
      this.load();
    },
    async load() {
      const after = new Date(this.after).getTime() / 1000 || 0;
      const before = new Date(this.before).getTime() / 1000 || 0;
      try {
        this.isLoading = true;
        const res = await indexerApi.get('/likechain/likenft/v1/ranking', {
          params: {
            ignore_list: IGNORE_ADDRESS_LIST,
            after,
            before,
            stakeholder_name: this.stakeholder,
            creator: this.creator,
            collector: this.collector,
            type: this.type,
            limit: 20,
          },
        });
        this.classes = res.data.classes;
        if (!this.classes) return;
        const promises = this.classes.map((c) => getClass(c.id)
          .then((res) => {
            const {
              data: {
                lastSoldPrice,
                metadata: { creatorWallet: creator, soldCount },
              },
            } = res;
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
        this.classes = (await Promise.all(promises)).sort((a, b) => b.soldCount - a.soldCount);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
