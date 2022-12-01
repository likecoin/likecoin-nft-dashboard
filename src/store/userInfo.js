import { defineStore } from 'pinia';
import axios from 'axios';

import { isValidAddress } from '../utils/util';
import { API_PUBLIC_URL } from '../config';

export const useUserInfoStore = defineStore('userInfo', {
  state: () => ({
    likerIdByAddressMap: new Map(),
    addressByLikerIdMap: new Map(),
  }),
  getters: {
    getLikerIdByAddress: (state) => (address) => state.likerIdByAddressMap.get(address),
    getAddressByLikerId: (state) => (likerId) => state.addressByLikerIdMap.get(likerId),
  },
  actions: {
    async fetchLikerIdByAddress(address) {
      if (!isValidAddress(address) || this.likerIdByAddressMap.has(address)) return;
      try {
        // set the key to prevent duplicate requests
        this.likerIdByAddressMap.set(address, null);
        const { data } = await axios.get(`${API_PUBLIC_URL}/users/addr/${address}/min`);
        const likerId = data.user;
        this.likerIdByAddressMap.set(address, likerId);
        this.addressByLikerIdMap.set(likerId, address);
      } catch (error) {
        if (error.response?.status !== 404) {
          // remove the key to unblock future requests
          this.likerIdByAddressMap.delete(address);
        }
      }
    },
    async fetchAddressByLikerId(likerId) {
      if (!likerId) return;
      const { data } = await axios.get(`${API_PUBLIC_URL}/users/id/${likerId}/min`);
      const address = data.likeWallet;
      this.likerIdByAddressMap.set(address, likerId);
      this.addressByLikerIdMap.set(likerId, address);
    },
  },
});

export default useUserInfoStore;
