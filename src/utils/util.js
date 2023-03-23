import { bech32 } from 'bech32';
import BigNumber from 'bignumber.js';

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

export function downloadAsFile(content, name, type = 'text/csv') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  a.click();
  a.remove();
}

export function nanolikeToLIKE(nanolike) {
  return Number(new BigNumber(nanolike).dividedBy(1e9).toFixed(0));
}
