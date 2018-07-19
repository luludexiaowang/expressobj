const path = require('path');
const fs = require('fs');
const gutil = require('gulp-util');

const { log } = gutil;
const chalk = require('chalk');
const absolutePath = require('./path');

module.exports = {
  absolutePath,
  getEntry() {
    const { entry } = absolutePath;
    const js = path.resolve(entry, 'index.js');
    const html = path.resolve(entry, 'index.html');
    const favicon = path.resolve(entry, 'favicon.ico');
    return {
      js: {
        app: [js, `!file-loader!${html}`],
      },
      html: [
        {
          filename: 'index.html',
          template: html,
          inject: false,
          favicon: fs.existsSync(favicon) && favicon,
        },
      ],
    };
  },
  getProxy(name) {
    const proxyMap = {};
    return proxyMap[name];
  },
  log: (() => {
    const result = {};
    const levels = 'verbose,info,warning,error'.split(',');
    const colors = 'white,green,yellow,red'.split(',');
    levels.forEach((level, i) => {
      result[level] = (...args) => {
        args.unshift(chalk.bold(`[${level}]`));
        log.apply(gutil, args.map(arg => chalk[colors[i]](arg)));
      };
    });
    return result;
  })(),
};
