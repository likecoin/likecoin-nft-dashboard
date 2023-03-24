<template>
  <h2>Search by wallet or Liker ID</h2>
  <div>
    <label>
      Get
      <select v-model="type">
        <option value="creator">Creator</option>
        <option value="collector">Collector</option>
      </select>
      of
      <input
        v-model="inputString"
        type="text"
        size="40"
      >
      , order by
      <select v-model="orderBy">
        <option value="price">Price</option>
        <option value="count">Count</option>
      </select>
      , price by
      <select v-model="priceBy">
        <option value="nft">purchase price (NFT)</option>
        <option value="class">current value (class)</option>
      </select>
    </label>
    <button @click="load">
      Load
    </button>
  </div>
  <h3 v-if="responseField">
    {{ title }}
  </h3>
  <div>
    <button
      v-if="isLoadingAllPageData"
      disabled
    >
      Exporting data...
    </button>
    <button
      v-else-if="allPageData && allPageData.length"
      @click="exportAllPageData"
    >
      Download exported data
    </button>
    <button
      v-else
      @click="fetchAllPageData"
    >
      Export all data
    </button>
  </div>
  <div v-if="hasData">
    <button
      :disabled="!hasPreviousPage"
      @click="goToPreviousPage"
    >
      &lt;&lt; Previous
    </button>
    <span>Page {{ currentPage }}</span>
    <button
      :disabled="!hasNextPage"
      @click="goToNextPage"
    >
      Next &gt;&gt;
    </button>
    <table>
      <thead>
        <tr>
          <th rowspan="2">
            Account
          </th>
          <th colspan="3">
            Class
          </th>
          <th colspan="2">
            Collection
          </th>
        </tr>
        <tr>
          <th>Name</th>
          <th>Count</th>
          <th>Total Value</th>
          <th>Count</th>
          <th>Total Value</th>
        </tr>
      </thead>
      <tbody>
        <template
          v-for="c in currentPageData"
          :key="c.account"
        >
          <tr
            v-for="(col, i) in c.collections"
            :key="col.classId"
          >
            <td
              v-if="i === 0"
              :rowspan="c.collections.length"
            >
              <UserLink
                :wallet="c.account"
              />
            </td>
            <td>
              <NftLink
                :class-id="col.classId"
                :name="col.name || col.classId"
              />
            </td>
            <td>
              <strong>{{ col.count }}</strong>
            </td>
            <td>
              {{ col.totalValue }}
            </td>
            <td
              v-if="i === 0"
              :rowspan="c.collections.length"
            >
              {{ c.count }}
            </td>
            <td
              v-if="i === 0"
              :rowspan="c.collections.length"
            >
              {{ c.totalValue }} LIKE
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <button
      :disabled="!hasPreviousPage"
      @click="goToPreviousPage"
    >
      &lt;&lt; Previous
    </button>
    <span>Page {{ currentPage }}</span>
    <button
      :disabled="!hasNextPage"
      @click="goToNextPage"
    >
      Next &gt;&gt;
    </button>
  </div>
  <p v-else>
    No response
  </p>
</template>

<script setup>
import NftLink from '../components/NftLink.vue';
import UserLink from '../components/UserLink.vue';
</script>

<script>
import {
  IGNORE_ADDRESS_LIST,
  EXAMPLE_CREATOR_ADDRESS,
  INDEXER_QUERY_LIMIT,
} from '../config';
import { getMetadata, indexerApi } from '../utils/proxy';
import { isValidAddress, downloadAsFile, nanolikeToLIKE } from '../utils/util';
import { useUserInfoStore } from '../store/userInfo.js';

const INITIAL_PAGE = 1;

async function formatCollection(rawCollection) {
  const {
    iscn_id_prefix: iscnIdPrefix,
    class_id: classId,
    value,
    count,
  } = rawCollection;
  const result = {
    iscnIdPrefix,
    classId,
    count,
    name: '',
    totalValue: nanolikeToLIKE(value),
  };
  try {
    const { data } = await getMetadata(classId);
    result.name = data.name;
  } catch (err) {
    if (err.response && err.response.status !== 404) {
      // eslint-disable-next-line no-console
      console.error(err, iscnIdPrefix, classId);
    }
  }
  return result;
}

export default {
  name: 'NftSocialGraph',
  data() {
    return {
      type: 'collector',
      orderBy: 'price',
      priceBy: 'nft',
      inputString: EXAMPLE_CREATOR_ADDRESS,
      address: '',
      title: '',
      currentPage: 1,
      previousPageData: [],
      currentPageData: [],
      nextPageData: [],
      allPageData: [],
      isLoadingAllPageData: false,
    };
  },
  computed: {
    paramField() {
      switch (this.type) {
        case 'creator':
          return 'collector';
        case 'collector':
        default:
          return 'creator';
      }
    },
    responseField() {
      switch (this.type) {
        case 'creator':
          return 'creators';
        case 'collector':
        default:
          return 'collectors';
      }
    },
    previousPage() {
      return this.currentPage - 1;
    },
    nextPage() {
      return this.currentPage + 1;
    },
    hasData() {
      return this.currentPageData && this.currentPageData.length > 0;
    },
    hasPreviousPage() {
      return this.previousPage > 0;
    },
    hasNextPage() {
      return this.nextPageData && this.nextPageData.length > 0;
    },
  },
  mounted() {
    this.load();
  },
  methods: {
    async aggregate(accounts) {
      const promises = accounts
        .map(async (a) => {
          const account = {
            account: a.account,
            collections: [],
            count: a.count,
            totalValue: nanolikeToLIKE(a.total_value),
          };
          account.collections = await Promise.all(a.collections.map(formatCollection));
          return account;
        });
      return Promise.all(promises);
    },

    async fetchPageData(page = INITIAL_PAGE) {
      const i = page - 1;
      const params = {
        'pagination.limit': INDEXER_QUERY_LIMIT,
        'pagination.offset': i * INDEXER_QUERY_LIMIT,
        ignore_list: IGNORE_ADDRESS_LIST,
        reverse: true,
        order_by: this.orderBy,
        price_by: this.priceBy,
      };
      params[this.paramField] = this.address;
      const { data } = await indexerApi.get(`/likechain/likenft/v1/${this.type}`, { params });
      const accountData = data[this.responseField] || [];
      const pageData = await this.aggregate(accountData);
      return pageData;
    },

    async load() {
      await this.updateQueryAddress();
      this.allPageData = [];
      [
        this.currentPageData,
        this.nextPageData,
      ] = await Promise.all([
        this.fetchPageData(this.currentPage),
        this.fetchPageData(this.nextPage),
      ]);
      this.updateTitle();
    },
    async updateQueryAddress() {
      if (!this.inputString) {
        this.address = '';
        return;
      }
      if (isValidAddress(this.inputString)) {
        this.address = this.inputString;
        return;
      }
      if (useUserInfoStore().getAddressByLikerId(this.inputString)) {
        this.address = useUserInfoStore().getAddressByLikerId(this.inputString);
        return;
      }
      try {
        await useUserInfoStore().fetchAddressByLikerId(this.inputString);
        this.address = useUserInfoStore().getAddressByLikerId(this.inputString);
      } catch (error) {
        if (error.response?.status === 404) {
          // eslint-disable-next-line no-alert
          alert('Liker ID not found');
        } else {
          // eslint-disable-next-line no-alert
          alert(error);
        }
        this.address = null;
      }
    },
    updateTitle() {
      this.title = `The ${this.type}s of ${this.inputString}, total value by ${this.priceBy}`;
    },
    async fetchAllPageData() {
      this.allPageData = [];
      this.isLoadingAllPageData = true;
      let i = INITIAL_PAGE;
      let isPageEnd = false;
      while (!isPageEnd) {
        // eslint-disable-next-line no-await-in-loop
        const data = await this.fetchPageData(i);
        isPageEnd = !(data && data.length);
        if (!isPageEnd) this.allPageData = this.allPageData.concat(data);
        i += 1;
      }
      this.allPageData.sort(
        (a, b) => b.totalValue - a.totalValue,
      );

      this.isLoadingAllPageData = false;
    },
    exportAllPageData() {
      if (this.$gtag) {
        this.$gtag.event(`export_social_graph_${this.type}_data`, {
          event_category: 'export',
          event_label: 'social_graph',
          value: 1,
        });
      }
      const header = [`address, NFT count, NFT total value by ${this.priceBy}`];
      const content = this.allPageData.map((c) => `${c.account},${c.count},${c.totalValue}`);
      downloadAsFile(header.concat(content).join('\n'), `${this.type}_of_${this.inputString}.csv`, 'text/csv');
    },
    async goToPreviousPage() {
      this.currentPage -= 1;
      this.nextPageData = this.currentPageData;
      this.currentPageData = this.previousPageData;
      if (this.hasPreviousPage) {
        this.previousPageData = await this.fetchPageData(this.previousPage);
      } else {
        this.previousPageData = [];
      }
    },
    async goToNextPage() {
      this.currentPage += 1;
      this.previousPageData = this.currentPageData;
      this.currentPageData = this.nextPageData;
      this.nextPageData = await this.fetchPageData(this.nextPage);
    },
  },
};
</script>
