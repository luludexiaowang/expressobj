const { log } = require('../basic');

function isMultiStats(stats) {
  return stats.stats;
}
function getCompileTime(stats) {
  if (isMultiStats(stats)) {
    return stats.stats
      .reduce((time, innerStats) => Math.max(time, getCompileTime(innerStats)), 0);
  }
  return stats.endTime - stats.startTime;
}
function getErrorOrWarning(stats, type) {
  stats = stats.stats || stats;
  if (!Array.isArray(stats)) {
    stats = [stats];
  }
  let result = [];
  stats.forEach(item => {
    let deta = [];
    if (type === 'error') {
      deta = item.compilation.errors;
    } else if (type === 'warning') {
      deta = item.compilation.warnings;
    }
    if (Array.isArray(deta)) {
      result = result.concat(deta);
    }
  });
  return result;
}
function outputErrorOrWarning(stats, type) {
  getErrorOrWarning(stats, type).forEach(item => {
    const padding = Array(19 + 1).join(' ');
    log[type](`${item.toString().replace(/\n/g, `\n${padding}`)}`);
  });
}
class FriendlyErrorWebpackPlugin {
  apply(compiler) {
    compiler.plugin('done', stats => {
      const hasErrors = stats.hasErrors();
      const hasWarnings = stats.hasWarnings();

      if (hasErrors) {
        outputErrorOrWarning(stats, 'error');
        return;
      }
      if (hasWarnings) {
        outputErrorOrWarning(stats, 'warning');
        return;
      }
      if (!hasErrors && !hasWarnings) {
        log.info(`编译成功，耗时 ${getCompileTime(stats)} 毫秒`);
      }
    });
    compiler.plugin('invalid', () => {
      log.info('编译中...');
    });
  }
}
module.exports = FriendlyErrorWebpackPlugin;
