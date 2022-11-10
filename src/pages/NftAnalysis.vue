<template>
  <h2>Overview</h2>
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
</template>

<script>
import {
  IGNORE_ADDRESS_LIST,
  API_ADDRESS,
} from '../config.js';
import { indexerApi } from '../utils/proxy.js';

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
    indexerApi.get('/statistics/nft/nft-count', {
      params: { ignore_list: IGNORE_ADDRESS_LIST },
    }).then((res) => {
      this.nftCount = res.data.count;
    });
    indexerApi.get('/statistics/nft/trade', {
      params: { api_address: API_ADDRESS },
    }).then((res) => {
      this.tradeCount = res.data.count;
      this.tradeValue = Math.floor(res.data.total_volume / (10 ** 9));
    });
    indexerApi.get('/statistics/nft/creator-count').then((res) => {
      this.creatorCount = res.data.count;
    });
    indexerApi.get('/statistics/nft/owner-count').then((res) => {
      this.ownerCount = res.data.count;
    });
  },
};
</script>
