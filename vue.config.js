const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/likecoin-nft-dashboard/',
  devServer: {
    proxy: 'http://127.0.0.1:8997',
  },
});
