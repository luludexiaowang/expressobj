import Vue from 'vue';
import at from './index.vue';

export default class Ui {
  constructor(options) {
    const { container } = options;
    const ele = document.createElement('div');
    container.parentElement.appendChild(ele);
    this.vnode = new Vue(at).$mount(ele);
  }
  setContent(key, value) {
    const { vnode } = this;
    vnode.content[key] = value;
  }
}
