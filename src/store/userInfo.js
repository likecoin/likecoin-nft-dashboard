import { defineStore } from 'pinia';
import axios from 'axios';

import { API_PUBLIC_URL, COOLDOWN_TIME_IN_MS } from '../config';

export const useUserInfoStore = defineStore('userInfo', {
  state: () => ({
    likerIdMap: new Map(),
    fetchTimestampMap: new Map(),
  }),
  getters: {
    likerId: (state) => (address) => state.likerIdMap.get(address),
  },
  actions: {
    async fetchLikerId(address) {
      if (
        !address
        || this.likerIdMap.has(address)
        || (
          this.fetchTimestampMap.has(address)
          && Date.now() - this.fetchTimestampMap.get(address) < COOLDOWN_TIME_IN_MS
        )
      ) return;
      try {
        this.fetchTimestampMap.set(address, Date.now());
        const { data } = await axios.get(`${API_PUBLIC_URL}/users/addr/${address}/min`);
        this.likerIdMap.set(address, data.user);
      } catch (error) {
        if (error.response?.status === 404) {
          this.likerIdMap.set(address, null);
        } else {
          this.fetchTimestampMap.delete(address);
          this.fetchLikerId(address);
        }
      }
    },
  },
});

export default useUserInfoStore;
