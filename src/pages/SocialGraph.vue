<template>
  <h2>Search by wallet</h2>
  <div>
    <label>
      Get
      <select v-model="type">
        <option value="creator">Creator</option>
        <option value="collector">Collector</option>
      </select>
      Of
      <input
        v-model="account"
        type="text"
        size="40"
      >
    </label>
    <button @click="load">
      Load
    </button>
  </div>
  <h3 v-if="responseField">
    The {{ responseField }} of {{ account }}
  </h3>
  <div v-if="hasData">
    <button
      :disabled="!hasPreviousPage"
      @click="goToPreviousPage"
    >
      &lt;&lt; Previous
    </button>
    <text>Page: {{ currentPage }}</text>
    <button
      :disabled="!hasNextPage"
      @click="goToNextPage"
    >
      Next >>
    </button>
    <table>
      <tr>
        <th>Account</th>
        <th>Total Count</th>
        <th>Collections</th>
        <th>Total Value</th>
      </tr>
      <tr
        v-for="c in currentPageData.filter(({ account }) => !ignoreList.includes(account))"
        :key="c.account"
      >
        <td>
          <UserLink
            :wallet="c.account"
          />
        </td>
        <td>{{ c.count }}</td>
        <table>
          <tr
            v-for="col in c.collections"
            :key="col.classId"
          >
            <td>
              <NftLink
                :class-id="col.classId"
                :name="col.name"
              />
            </td>
            <td><strong>{{ col.count }}</strong> x {{ col.price }}</td>
          </tr>
        </table>
        <td>{{ c.totalValue }} LIKE</td>
      </tr>
    </table>
    <button
      :disabled="!hasPreviousPage"
      @click="goToPreviousPage"
    >
      &lt;&lt; Previous
    </button>
    <text>Page: {{ currentPage }}</text>
    <button
      :disabled="!hasNextPage"
      @click="goToNextPage"
    >
      Next >>
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
import { getClass, getMetadata, indexerApi } from '../utils/proxy';

async function getCollection({ iscn_id_prefix: iscnIdPrefix, class_id: classId, count }) {
  const collection = {
    iscnIdPrefix,
    classId,
    count,
  };
  try {
    const [
      purchaseRes,
      metadataRes,
    ] = await Promise.all([
      getClass(classId),
      getMetadata(classId),
    ]);
    const { lastSoldPrice: price } = purchaseRes.data;
    return {
      price,
      totalValue: count * price,
      ...collection,
      ...metadataRes.data,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
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
      account: EXAMPLE_CREATOR_ADDRESS,
      currentPage: 1,
      previousPageData: [],
      currentPageData: [],
      nextPageData: [],
      ignoreList: IGNORE_ADDRESS_LIST,
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
        .filter((a) => !this.ignoreList.includes(a.account))
        .map(async (a) => {
          const account = {
            account: a.account,
            collections: [],
            count: a.count,
            totalValue: 0,
          };
          account.collections = await Promise.all(a.collections.map(getCollection));
          account.totalValue = account.collections.reduce(
            (total, { totalValue }) => total + totalValue,
            0,
          );
          return account;
        });
      return (await Promise.all(promises)).sort(
        (a, b) => b.totalValue - a.totalValue,
      );
    },

    async fetchPageData(page) {
      const i = page - 1;
      const params = {
        'pagination.limit': INDEXER_QUERY_LIMIT,
        'pagination.offset': i * INDEXER_QUERY_LIMIT,
        reverse: true,
      };
      params[this.paramField] = this.account;
      const { data } = await indexerApi.get(`/likechain/likenft/v1/${this.type}`, { params });
      const accountData = data[this.responseField] || [];
      const pageData = await this.aggregate(accountData);
      return pageData;
    },

    async load() {
      [
        this.currentPageData,
        this.nextPageData,
      ] = await Promise.all([
        this.fetchPageData(this.currentPage),
        this.fetchPageData(this.nextPage),
      ]);
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
