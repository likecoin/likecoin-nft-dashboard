import { defineStore } from 'pinia';
import axios from 'axios';

import { API_PUBLIC_URL } from '../config';

export const useUserInfoStore = defineStore('userInfo', {
  state: () => ({
    likerIdMap: new Map(),
  }),
  getters: {
    likerId: (state) => (address) => state.likerIdMap.get(address),
  },
  actions: {
    async fetchLikerId(address) {
      if (!address || this.likerIdMap.has(address)) return;
      try {
        // set the key to prevent duplicate requests
        this.likerIdMap.set(address, null);
        const { data } = await axios.get(`${API_PUBLIC_URL}/users/addr/${address}/min`);
        this.likerIdMap.set(address, data.user);
      } catch (error) {
        if (error.response?.status !== 404) {
          // remove the key to unblock future requests
          this.likerIdMap.delete(address);
        }
      }
    },
  },
});

export default useUserInfoStore;
