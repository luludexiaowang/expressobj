const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseConf = require('./webpack_base_config');

baseConf.plugins.forEach(plugin => {
  if (plugin instanceof HtmlWebpackPlugin) {
    plugin.options.inApp = 'false';
  }
});

baseConf.resolve.alias.vue = 'vue/dist/vue.common.js';
baseConf.plugins.push(new webpack.HotModuleReplacementPlugin());
baseConf.devtool = 'eval-source-map';

module.exports = baseConf;
