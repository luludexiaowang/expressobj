const path = require('path');

const project = path.resolve(__dirname, '../..');
const dist = path.resolve(project, 'dist');
const src = path.resolve(project, 'src');
const build = path.resolve(project, 'build');
const entry = path.resolve(src, 'entry');
const expand = path.resolve(src, 'vue_expand');
const wrapper = path.resolve(src, 'wrapper');
const asset = path.resolve(expand, 'asset');
const component = path.resolve(expand, 'component');
const directive = path.resolve(expand, 'directive');
const filter = path.resolve(expand, 'filter');
const mixin = path.resolve(expand, 'mixin');
const plugin = path.resolve(expand, 'plugin');
const router = path.resolve(expand, 'router');
const store = path.resolve(expand, 'store');
const style = path.resolve(expand, 'style');
const view = path.resolve(expand, 'view');

module.exports = {
  project,
  dist,
  src,
  build,
  entry,
  expand,
  wrapper,
  component,
  directive,
  filter,
  asset,
  mixin,
  plugin,
  router,
  store,
  style,
  view,
};
