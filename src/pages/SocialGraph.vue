<template>
  <h2>Search by wallet or Liker ID</h2>
  <div>
    <label>
      Get
      <select v-model="type">
        <option value="creator">Creator</option>
        <option value="collector">Collector</option>
      </select>
      Of
      <input
        v-model="inputString"
        type="text"
        size="40"
      >
    </label>
    <button @click="load">
      Load
    </button>
  </div>
  <h3 v-if="responseField">
    {{ title }}
  </h3>
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
      <tr>
        <th>Account</th>
        <th>Total Count</th>
        <th>Collections</th>
        <th>Total Value</th>
      </tr>
      <tr
        v-for="c in currentPageData"
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
import { getClass, getMetadata, indexerApi } from '../utils/proxy';
import { isValidAddress } from '../utils/util';
import { useUserInfoStore } from '../store/userInfo.js';

const INITIAL_PAGE = 1;

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
      inputString: EXAMPLE_CREATOR_ADDRESS,
      address: '',
      title: '',
      currentPage: 1,
      previousPageData: [],
      currentPageData: [],
      nextPageData: [],
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

    async fetchPageData(page = INITIAL_PAGE) {
      const i = page - 1;
      const params = {
        'pagination.limit': INDEXER_QUERY_LIMIT,
        'pagination.offset': i * INDEXER_QUERY_LIMIT,
        ignore_list: IGNORE_ADDRESS_LIST,
        reverse: true,
      };
      params[this.paramField] = this.address;
      const { data } = await indexerApi.get(`/likechain/likenft/v1/${this.type}`, { params });
      const accountData = data[this.responseField] || [];
      const pageData = await this.aggregate(accountData);
      return pageData;
    },

    async load() {
      await this.updateQueryAddress();
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
      this.title = `The ${this.type}s of ${this.inputString}`;
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
