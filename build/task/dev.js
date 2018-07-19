const gulp = require('gulp');
const webpack = require('webpack');
const minimist = require('minimist');
const WebpackDevServer = require('webpack-dev-server');
const { getProxy, log } = require('../basic');


const argsOption = {
  string: ['host', 'port', 'proxy'],
  default: {
    host: 'localhost',
    port: '8888',
    proxy: '',
  },
};
const args = minimist(process.argv, argsOption);
gulp.task('dev', (cb) => {
  const webpackConf = require('../config/webpack_dev_config');
  const serverConf = {
    compress: false,
    hot: true,
    quiet: true,
    stats: {
      colors: true,
    },
    proxy: getProxy(args.proxy),
    host: args.host,
    port: args.port,
  };
  WebpackDevServer.addDevServerEntrypoints(webpackConf, serverConf);
  const compiler = webpack(webpackConf);
  const server = new WebpackDevServer(compiler, serverConf);
  server.listen(args.port, args.host, (err) => {
    if (err) {
      log.error('开发服务器启动失败');
      cb(err);
      return;
    }
    log.info(`开发服务器启动成功，地址：http://${args.host}:${args.port}`);
    cb();
  });
});
