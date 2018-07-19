const gulp = require('gulp');
const webpack = require('webpack');
const rimraf = require('rimraf');
const minimist = require('minimist');
const zip = require('gulp-zip');
const { log } = require('../basic');

const argsOption = {
  string: ['publicPath'],
  default: {
    publicPath: '',
  },
};
const args = minimist(process.argv, argsOption);
gulp.task('build', (cb) => {
  const webpackConf = require('../config/webpack_rel_config');
  if (args.publicPath) {
    webpackConf.output.publicPath = args.publicPath;
  }
  rimraf(webpackConf.output.path, (e1) => {
    if (e1) {
      log.error('删除目录失败');
      cb(e1);
      return;
    }
    webpack(webpackConf, (e2) => {
      if (e2) {
        log.error('构建失败');
        cb(e2);
        return;
      }
      log.info('构建成功');
      cb();
    });
  });
});
gulp.task('rel', ['build'], () => {
  return gulp
    .src(['dist/*', '!dist/download.html'])
    .pipe(zip('editor.zip'))
    .pipe(gulp.dest('dist'));
});
