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
  <table v-if="response">
    <tr>
      <th>Account</th>
      <th>Total Count</th>
      <th>Collections</th>
      <th>Total Value</th>
    </tr>
    <tr
      v-for="c in response.filter(({ account }) => !ignoreList.includes(account))"
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
      currentPage: Number(this.$route.query.page),
      response: [],
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
  },
  mounted() {
    if (!this.currentPage || !Number.isInteger(this.currentPage) || this.currentPage < 1) {
      this.$router.replace({ query: { page: 1 } });
      this.currentPage = 1;
    }
    this.load();
  },
  methods: {
    aggregate(accounts) {
      return accounts
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
    },

    async load() {
      const params = {
        'pagination.limit': INDEXER_QUERY_LIMIT,
        'pagination.offset': (this.currentPage - 1) * INDEXER_QUERY_LIMIT,
        reverse: true,
      };
      params[this.paramField] = this.account;
      const { data } = await indexerApi.get(`/likechain/likenft/v1/${this.type}`, { params });
      const accountData = data[this.responseField];
      this.response = await Promise.all(this.aggregate(accountData));
    },
  },
};
</script>
