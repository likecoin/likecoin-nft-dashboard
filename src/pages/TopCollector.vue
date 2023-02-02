<template>
  <h2>Top NFT Collectors</h2>
  <div>
    <label>
      Filter By NFT Class ID
      <input
        v-model="classIdInputString"
        type="text"
        size="40"
      >
    </label>
    <button @click="getCollectorList">
      Filter
    </button>
  </div>
  <section>
    <button @click="exportPageData">
      Export result
    </button>
  </section>
  <table>
    <tr>
      <th>Address</th>
      <th>Count</th>
    </tr>
    <tr
      v-for="owner in owners"
      :key="owner.owner"
    >
      <td>
        <UserLink
          :wallet="owner.owner"
        />
      </td>
      <td>{{ owner.count }}</td>
    </tr>
  </table>
</template>

<script setup>
import UserLink from '../components/UserLink.vue';
</script>

<script>
import { indexerApi } from '../utils/proxy.js';
import { downloadAsFile } from '../utils/util';

const limit = 20;

export default {
  name: 'TopCollectors',
  data() {
    return {
      owners: [],
      classId: '',
      classIdInputString: '',
    };
  },
  mounted() {
    this.getGlobalTopCollectorList();
  },
  methods: {
    async getGlobalTopCollectorList() {
      const res = await indexerApi.get('/statistics/nft/owners', { params: { limit } });
      this.owners = res.data.owners;
    },
    async getCollectorList() {
      this.classId = this.classIdInputString;
      if (!this.classId) {
        await this.getGlobalTopCollectorList();
        return;
      }
      const res = await indexerApi.get(`/likechain/likenft/v1/owner?class_id=${encodeURIComponent(this.classId)}`);
      this.owners = res.data.owners.sort((a, b) => b.count - a.count);
    },
    exportPageData() {
      if (this.$gtag) {
        this.$gtag.event('export_collector_data', {
          event_category: 'export',
          event_label: 'collector',
          value: 1,
        });
      }
      const header = ['address, count'];
      const contents = this.owners.map((o) => `${o.owner},${o.count}`);
      downloadAsFile(header.concat(contents).join('\n'), `collector_${this.classId || 'global'}.csv`, 'text/csv');
    },
  },
};
</script>
