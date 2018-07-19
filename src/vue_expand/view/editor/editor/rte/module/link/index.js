/* eslint-disable func-names */
import Quill from 'quill';
import $ from 'jquery';
import Indivisible from '../indivisible';
import Ui from './ui/index.js';
import event from '../../../config/event';
import Bridge from '../../../../../../../wrapper/native';

const bridge = Bridge.getInstance();
const Inline = Quill.import('blots/inline');
const Module = Quill.import('core/module');

class LinkBlot extends Inline {
  static blotName = 'link';
  static tagName = 'A';
  static create(value) {
    const node = super.create(value);
    node.setAttribute('href', value);
    node.setAttribute('target', '_blank');
    return node;
  }
  static formats(domNode) {
    return domNode.getAttribute('href');
  }
}
Quill.register('blots/link', LinkBlot, true);
Indivisible.invisibleMap.link = {
  allowKeyboardDelete: true,
  allowAllDelete: true,
};

export default class Link extends Module {
  static moduleName = 'link';
  constructor(quill, options) {
    super(quill, options);
    quill.link = this;
    this.ui = new Ui({
      emitter: this.emitter,
    });

    if (window.inApp) {
      const _this = this;
      $(quill.root).delegate('a', 'touchend', function () {
        _this.editing = this;
        bridge.route('onEditLink', {
          href: this.getAttribute('href'),
          text: this.textContent,
        });
      });
    } else {
      $(quill.root).delegate('a', 'mouseover', function () {
        const { emt } = quill;
        if (emt) {
          emt.emit(event.LINK_UPDATE, this, this.textContent, this.getAttribute('href'), this);
        }
      });
    }
  }
}
