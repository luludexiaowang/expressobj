const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseConf = require('./webpack_base_config');

baseConf.resolve.alias.vue = 'vue/dist/vue.min.js';

baseConf.output.filename = baseConf.output.filename.replace('hash', 'chunkhash');
baseConf.output.chunkFilename = baseConf.output.chunkFilename.replace('hash', 'chunkhash');

Object.keys(baseConf.entry).forEach(key => {
  const entry = baseConf.entry[key];
  if (Array.isArray(entry)) {
    for (let i = 0; i < entry.length; i += 1) {
      if (typeof entry[i] === 'string' && entry[i].indexOf('html') > -1) {
        entry.splice(i, 1);
        break;
      }
    }
  }
  entry.unshift('babel-polyfill');
});
const styleExtract = new ExtractTextPlugin('style.[contenthash:7].css');
baseConf.plugins.forEach(plugin => {
  if (plugin instanceof HtmlWebpackPlugin) {
    plugin.options.inApp = 'true';
  }
});
baseConf.plugins = baseConf.plugins.concat([
  styleExtract,
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '"production"',
    },
  }),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
    },
  }),
]);

baseConf.module.rules.forEach(rule => {
  const test = rule.test.toString();
  if (test === '/\\.vue$/') {
    if (rule.enforce !== 'pre') {
      rule.use[0].options.loaders.css = styleExtract.extract({
        use: ['css-loader'],
        fallback: 'vue-style-loader',
      });
      rule.use[0].options.loaders.less = styleExtract.extract({
        use: ['css-loader', 'less-loader'],
        fallback: 'vue-style-loader',
      });
    }
  }
  if (test === '/\\.less$/') {
    rule.use = styleExtract.extract({
      use: ['css-loader', 'less-loader'],
      fallback: 'style-loader',
    });
  }
  if (test === '/\\.css$/') {
    rule.use = styleExtract.extract({
      use: ['css-loader'],
      fallback: 'style-loader',
    });
  }
});

module.exports = baseConf;
