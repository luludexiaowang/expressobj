const autoprefixer = require('autoprefixer');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('../plugin/firendly-error-webpack-plugin');
const { absolutePath, getEntry } = require('../basic');

const extraInclude = [
  path.resolve(absolutePath.project, 'node_modules/quill'),
  path.resolve(absolutePath.project, 'node_modules/crypto-random-string'),
];
const entry = getEntry();
module.exports = {
  entry: entry.js,
  output: {
    path: absolutePath.dist,
    filename: '[name].[hash:8].js',
    chunkFilename: '[name].[hash:8].js',
  },
  resolve: {
    extensions: ['.vue', '.js', '.json'],
    alias: absolutePath,
  },
  plugins: entry.html.map((option) => {
    return new HtmlWebpackPlugin(option);
  }).concat([new FriendlyErrorsPlugin(), new HtmlWebpackPlugin({
    filename: 'style.html',
    template: path.resolve(absolutePath.view, 'editor/editor/rte/style.html'),
    inject: false,
  }), new HtmlWebpackPlugin({
    filename: 'download.html',
    template: path.resolve(absolutePath.entry, 'download.html'),
    inject: false,
  })]),
  module: {
    rules: [{
      test: /\.vue$/,
      include: [absolutePath.src].concat(extraInclude),
      use: [{
        loader: 'vue-loader',
        options: {
          preserveWhitespace: false,
          extractCSS: false,
          postcss: {
            plugins: [autoprefixer({ browsers: ['last 2 versions'] })],
          },
          cssModules: {
            camelCase: true,
            localIdentName: '[local]-[hash:base64:5]',
          },
          loaders: {
            less: 'vue-style-loader?sourceMap!css-loader?sourceMap!less-loader?sourceMap'.split('!'),
            css: 'vue-style-loader?sourceMap!css-loader?sourceMap'.split('!'),
          },
        },
      }, 'eslint-loader'],
    }, {
      test: /\.js$/,
      include: [absolutePath.src].concat(extraInclude),
      use: ['babel-loader', 'eslint-loader'],
    }, {
      test: /\.css$/,
      use: 'style-loader?sourceMap!css-loader?sourceMap'.split('!'),
    }, {
      test: /\.less$/,
      use: 'style-loader?sourceMap!css-loader?sourceMap!less-loader?sourceMap'.split('!'),
    },
    {
      test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)(\?.*)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 1024 * 8,
          name: '[name].[hash:7].[ext]',
        },
      }],
    },
    ],
  },
};
