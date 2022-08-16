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
      <td>Creator Count</td>
      <td>{{ creatorCount }}</td>
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
    <tr
      v-for="owner in owners"
      :key="owner.owner"
    >
      <td>{{ owner.owner }}</td>
      <td>{{ owner.count }}</td>
    </tr>
  </table>
</template>

<script>
import {
  IGNORE_ADDRESS_LIST,
  API_ADDRESS,
} from '../config.js';
import { indexerApi } from '../utils/proxy.js';

const limit = 20;

export default {
  name: 'NftAnalysis',
  data() {
    return {
      nftCount: 0,
      ownerCount: 0,
      tradeCount: 0,
      tradeValue: 0,
      creatorCount: 0,
      owners: [],
    };
  },
  mounted() {
    indexerApi.get('/analysis/nft-count', {
      params: { ignore_list: IGNORE_ADDRESS_LIST },
    }).then((res) => {
      this.nftCount = res.data.count;
    });
    indexerApi.get('/analysis/trade', {
      params: { api_address: API_ADDRESS },
    }).then((res) => {
      this.tradeCount = res.data.count;
      this.tradeValue = Math.floor(res.data.total_volume / (10 ** 9));
    });
    indexerApi.get('/analysis/creator-count').then((res) => {
      this.creatorCount = res.data.count;
    });
    indexerApi.get('/analysis/owner-count').then((res) => {
      this.ownerCount = res.data.count;
    });
    indexerApi.get('/analysis/owners', { params: { limit } }).then((res) => {
      this.owners = res.data.owners;
    });
  },
};
</script>
