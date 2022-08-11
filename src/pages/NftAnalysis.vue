<template>
  <h2>Analysis</h2>
  <table>
    <tr>
      <td>Nft Count</td>
      <td>{{ nftCount }}</td>
    </tr>
    <tr>
      <td>Trade Count</td>
      <td>{{ tradeCount }}</td>
    </tr>
    <tr>
      <td>Trade Value</td>
      <td>{{ tradeValue }} LIKE</td>
    </tr>
    <tr>
      <td>Owner Count</td>
      <td>{{ ownerCount }}</td>
    </tr>
  </table>
  <h3>Top NFT Owners</h3>
  <table>
    <tr>
      <th>Address</th>
      <th>Count</th>
    </tr>
    <tr v-for="owner in owners" :key="owner.owner">
      <td>{{ owner.owner }}</td>
      <td>{{ owner.count }}</td>
    </tr>
  </table>
</template>

<script>
import axios from 'axios';
import {
  INDEXER,
  IGNORE_LIST,
} from '../config.js';

const api = axios.create({
  baseURL: INDEXER,
});

const limit = 20;

export default {
  name: 'NftAnalysis',
  data() {
    return {
      nftCount: 0,
      ownerCount: 0,
      tradeCount: 0,
      tradeValue: 0,
      owners: [],
    }
  },
  mounted() {
    api.get('/analysis/nft-count', {
      params: { ignore_list: IGNORE_LIST }
    }).then(res => {
      this.nftCount = res.data.count
    })
    api.get('/analysis/trade', {
      params: { api_address: IGNORE_LIST[0] }
    }).then(res => {
      this.tradeCount = res.data.count
      this.tradeValue = Math.floor(res.data.total_volume / (10**9))
    })
    api.get('/analysis/owner-count').then(res => {
      this.ownerCount = res.data.count
    })
    api.get('/analysis/owners', { params: { limit } }).then(res => {
      this.owners = res.data.owners
    })
  }
}
</script>
