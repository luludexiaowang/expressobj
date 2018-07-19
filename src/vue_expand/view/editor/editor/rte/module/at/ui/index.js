import Vue from 'vue';
import at from './index.vue';

export default class At {
  constructor(options) {
    const ele = document.createElement('div');
    document.body.appendChild(ele);
    this.vnode = new Vue(at).$mount(ele);
    this.vnode.target = options.target;
    this.vnode.emitter = options.emitter;
    this.vnode.owner = this;
    this.options = options;
  }
  _afterFetch(data) {
    const { vnode } = this;
    vnode.data = data;
    if (data.length > 0) {
      vnode.selectedIndex = 0;
    } else {
      vnode.selectedIndex = -1;
    }
    this.show();
  }
  _open() {
    const { vnode } = this;
    vnode.open = true;
  }
  _hide() {
    const { vnode } = this;
    vnode.open = false;
  }
  select(user) {
    const { options: { emitter } } = this;
    this.stop();
    emitter.emit('select-who', user);
  }
  fetch(query) {
    const { options: { onFetch } } = this;
    if (query.length >= 0 && typeof onFetch === 'function') {
      onFetch(query, this._afterFetch.bind(this));
    } else {
      this.hide();
    }
  }
  start() {
    const { options: { onStart } } = this;
    if (typeof onStart === 'function') {
      onStart();
    }
  }
  stop() {
    const { options: { onStop } } = this;
    this.hide();
    if (typeof onStop === 'function') {
      onStop();
    }
  }
  show() {
    this._open();
  }
  hide() {
    this._hide();
  }
  isOpen() {
    const { vnode } = this;
    return vnode.open;
  }
  getSelected() {
    const { vnode: { selectedIndex, data } } = this;
    return data[selectedIndex];
  }
  move(deta) {
    const { vnode, vnode: { selectedIndex, data } } = this;
    if (data.length > 0) {
      vnode.selectedIndex = Math.min(Math.max(selectedIndex + deta, 0), data.length - 1);
    } else {
      vnode.selectedIndex = -1;
    }
  }
}
