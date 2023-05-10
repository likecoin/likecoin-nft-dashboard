const { VUE_APP_INDEXER_URL } = process.env;

export const IS_TESTNET = false;
export const INDEXER_URL = VUE_APP_INDEXER_URL || (IS_TESTNET ? 'https://node.testnet.like.co' : 'https://mainnet-node.like.co');
export const API_PUBLIC_URL = IS_TESTNET ? 'https://api.rinkeby.like.co' : 'https://api.like.co';
export const EXAMPLE_CREATOR_ADDRESS = 'like13f4glvg80zvfrrs7utft5p68pct4mcq7t5atf6';

// The like.co API address
export const API_ADDRESS = IS_TESTNET ? 'like1yney2cqn5qdrlc50yr5l53898ufdhxafqz9gxp' : 'like17m4vwrnhjmd20uu7tst7nv0kap6ee7js69jfrs';
export const IGNORE_ADDRESS_LIST = [
  API_ADDRESS,
  // The like.co API address in testnet
  'like1yney2cqn5qdrlc50yr5l53898ufdhxafqz9gxp',
];

export const INDEXER_QUERY_LIMIT = 100;

export const EARLEST_NFT_DATE = '2022-07-01';
