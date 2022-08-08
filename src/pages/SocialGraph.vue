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
  <h3 v-if="responseType">{{ responseType }} of {{ account }}</h3>
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
    async load() {
      if (this.type === 'collector') {
        const res = await axios.get(`${INDEXER}/likechain/likenft/v1/collector`, {
          params: {
            creator: this.account,
            reverse: true,
          },
        });
        this.response = res.data.collectors;
        this.responseType = 'Collectors';
        this.response = await this.aggregate(this.response);
      }
      if (this.type === 'creator') {
        const res = await axios.get(`${INDEXER}/likechain/likenft/v1/creator`, {
          params: {
            collector: this.account,
            reverse: true,
          },
        });
        this.response = res.data.creators;
        this.responseType = 'Creators';
        this.response = await this.aggregate(this.response);
      }
    },
    async aggregate(accounts) {
      const promises = [];
      const newAccounts = [];
      accounts.filter(a => !this.ignoreList.includes(a.account)).forEach((a) => {
        const account = {
          account: a.account,
          collections: [],
          count: a.count,
          totalValue: 0,
        };
        a.collections.forEach(
          ({ iscn_id_prefix: iscnIdPrefix, class_id: classId, count }) => {
            let collection = {
              iscnIdPrefix,
              classId,
              count,
            }
            promises.push(
              getClass(classId)
              .then((res) => {
                const {
                  lastSoldPrice: price,
                } = res.data;
                collection.price = price;
                collection.totalValue = count * price;
                account.totalValue += count * price;
                return getMetadata(classId)
              })
              .then((res) => {
                collection = {
                  ...collection,
                  ...res.data,
                }
              })
              .catch((err) => {
                console.error(err.message, iscnIdPrefix, classId);
                collection.price = 0;
                collection.totalValue = 0;
              })
              .finally(() => {
                account.collections.push(collection)
              })
            );
          },
        );
        newAccounts.push(account);
      });
      await Promise.all(promises);
      return newAccounts.sort((a, b) => b.totalValue - a.totalValue);
    },
  },
}
</script>
