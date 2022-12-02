<template>
  <a
    :href="`https://liker.land/${wallet}`"
    target="_blank"
    rel="noopener"
  >{{ likerId || wallet }} </a>
</template>

<script>
import { useUserInfoStore } from '../store/userInfo.js';

export default {
  name: 'UserLink',
  props: {
    wallet: {
      type: String,
      required: true,
    },
  },
  computed: {
    likerId() {
      return useUserInfoStore().getLikerIdByAddress(this.wallet);
    },
  },
  mounted() {
    useUserInfoStore().fetchLikerIdByAddress(this.wallet);
  },
};
</script>
