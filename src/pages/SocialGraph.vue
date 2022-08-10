<template>
  <h2>Social Graph</h2>
  <div>
    <label>
        Get
        <select v-model="type">
          <option value="creator">Creator</option>
          <option value="collector">Collector</option>
        </select>
        Of
        <input v-model="account" type="text" size="40">
    </label>
    <button @click="load">Load</button>
  </div>
  <h3 v-if="responseType">The {{ responseType }} of {{ account }}</h3>
  <table v-if="response">
    <tr>
      <th>Account</th>
      <th>Total Count</th>
      <th>Collections</th>
      <th>Total Value</th>
    </tr>
    <tr v-for="c in response.filter(({ account }) => !ignoreList.includes(account))" :key="c.account">
      <td>{{ c.account }}</td>
      <td>{{ c.count }}</td>
      <table>
        <tr v-for="col in c.collections" :key="col.classId">
          <td><a :href="col.external_url" target="_blank">{{ col.name }}</a></td>
          <td><strong>{{ col.count }}</strong> x {{ col.price }}</td>
        </tr>
      </table>
      <td>{{ c.totalValue }} LIKE</td>
    </tr>
  </table>
  <p v-else>No response</p>
</template>

<script>
import axios from 'axios';
import {
  INDEXER, IGNORE_LIST,
} from '../config';
import { getClass, getMetadata } from '../utils/proxy';

const typeMap = new Map([
  ["collector", { param: "creator", responseType: "collectors" }],
  ["creator", { param: "collector", responseType: "creators" }],
]);

async function getCollection({ iscn_id_prefix: iscnIdPrefix, class_id: classId, count }) {
  const collection = {
    iscnIdPrefix,
    classId,
    count,
  };
  try {
    const [purchaseRes, metadataRes] = await Promise.all([getClass(classId), getMetadata(classId)]);
    const { lastSoldPrice: price } = purchaseRes.data;
    return {
      price,
        totalValue: count * price,
        ...collection,
        ...metadataRes.data,
    };
  } catch (err) {
    console.error(err, iscnIdPrefix, classId);
    return {
      ...collection,
        price: 0,
        totalValue: 0,
    };
  }
}

export default {
  name: 'NftSocialGraph',
  data() {
    return {
      type: 'collector',
      account: 'like13f4glvg80zvfrrs7utft5p68pct4mcq7t5atf6',
      responseType: '',
      response: [],
      ignoreList: IGNORE_LIST,
    }
  },
  methods: {
    async aggregate(accounts) {
      const promises = accounts
        .filter(a => !this.ignoreList.includes(a.account))
        .map(async (a) => {
          const account = {
            account: a.account,
            collections: [],
            count: a.count,
            totalValue: 0,
          };
          account.collections = await Promise.all(a.collections.map(getCollection));
          account.totalValue = account.collections.reduce((total, { totalValue }) => total + totalValue, 0);
          return account;
        });
      return (await Promise.all(promises)).sort(
        (a, b) => b.totalValue - a.totalValue,
      );
    },

    async load() {
      if (!typeMap.has(this.type)) return;
      const type = typeMap.get(this.type);
      const params = {
         reverse: true,
      };
      params[type.param] = this.account;
      const res = await axios.get(`${INDEXER}/likechain/likenft/v1/${this.type}`, { params });
      this.response = res.data[type.responseType];
      this.responseType = type.responseType;
      this.response = await this.aggregate(this.response);
    },
  },
}
</script>
