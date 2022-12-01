import { bech32 } from 'bech32';

export function isValidAddress(address) {
  try {
    const { prefix, words } = bech32.decode(address);
    return [
      'cosmos',
      'like',
    ].includes(prefix) && words.length === 32;
  } catch (error) {
    return false;
  }
}

export default isValidAddress;
