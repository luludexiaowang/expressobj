import Vue from 'vue';
import Comp from './index.vue';

export default class Ui {
  constructor(options) {
    const ele = document.createElement('div');
    document.body.appendChild(ele);
    this.vnode = new Vue(Comp).$mount(ele);
    this.options = options;
  }
  show(target, text, href, ele, saveCb, removeCb) {
    const { vnode } = this;
    vnode.target = target;
    vnode.text = text;
    vnode.href = href;
    vnode.tip = '';
    vnode.saveCb = saveCb;
    vnode.removeCb = removeCb;
    vnode.ele = ele;
    vnode.open = true;
  }
  hide() {
    const { vnode } = this;
    vnode.open = false;
  }
}
