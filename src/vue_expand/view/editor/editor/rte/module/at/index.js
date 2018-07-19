import Quill from 'quill';
import Keyboard from 'quill/modules/keyboard';
import EventEmitter from 'wolfy87-eventemitter';
import Ui from './ui/index.js';
import './index.less';
import Indivisible from '../indivisible';
import Blot from '../../util/blot';

/* eslint-disable no-shadow,camelcase */
const Inline = Quill.import('blots/inline');
const Module = Quill.import('core/module');
const Delta = Quill.import('delta');

class AtingBlot extends Inline {
  static blotName = 'ating';
  static className = 'ql-ating';
  static create(value) {
    const node = super.create(value);
    return node;
  }
  static formats(domNode) {
    if (domNode.tagName === this.tagName && domNode.classList.contains(this.className)) {
      return true;
    }
    return super.formats(domNode);
  }
  static find_ating_blot(blot) {
    let found = null;
    while (blot) {
      if (blot instanceof AtingBlot) {
        found = blot;
        break;
      }
      blot = blot.parent;
    }
    return found;
  }
}
Inline.order.push('ating');
Quill.register('blots/ating', AtingBlot);
Indivisible.invisibleEnvMap.ating = true;

class AtBlot extends Inline {
  static blotName = 'at';
  static className = 'ql-at';
  static create(value) {
    const node = super.create(value);
    node.setAttribute('uid', value);
    return node;
  }
  static formats(domNode) {
    if (domNode.tagName === this.tagName && domNode.classList.contains(this.className)) {
      return domNode.getAttribute('uid');
    }
    return super.formats(domNode);
  }
}
Inline.order.push('at');
Quill.register('blots/at', AtBlot);
Indivisible.invisibleMap.at = {
  allowKeyboardDelete: true,
  allowAllDelete: true,
};

export default class At extends Module {
  static moduleName = 'at';
  constructor(quill, options) {
    super(quill, options);

    quill.at = this;
    this.emitter = new EventEmitter();
    this.ui = new Ui({
      target: quill.root,
      emitter: this.emitter,
      ...options,
    });
    this.lastSelection = null;

    const { keyboard } = quill;
    keyboard.addBinding({
      key: Keyboard.keys.UP,
    }, () => {
      const { ui } = this;
      if (ui.isOpen()) {
        ui.move(-1);
        return false;
      }
      return true;
    });
    keyboard.addBinding({
      key: Keyboard.keys.DOWN,
    }, () => {
      const { ui } = this;
      if (ui.isOpen()) {
        ui.move(1);
        return false;
      }
      return true;
    });

    keyboard.bindings[Keyboard.keys.ENTER].unshift({
      key: Keyboard.keys.ENTER,
      handler: () => {
        const { ui } = this;
        if (ui.isOpen()) {
          const selected = ui.getSelected();
          if (selected) {
            ui.select(selected);
            return false;
          }
        }
        return true;
      },
    });
    quill.on('selection-change', (range, oldRange) => {
      if (!range) {
        this.lastSelection = oldRange;
      }
    });
    quill.on('text-change', (delta, oldDelta, source) => {
      if (source !== 'api') {
        this.applyChange(this.getFormatChange(delta));
        this.applyChange(this.getContentChange());
      }
    });
    this.emitter.on('select-who', this.select.bind(this));
  }
  select(item) {
    const { quill } = this;
    const range = quill.getSelection() || this.lastSelection;
    if (range && !range.length) {
      const [leaf] = quill.getLeaf(range.index);
      if (leaf) {
        const found = AtingBlot.find_ating_blot(leaf);
        if (found) {
          const index = Blot.get_index(found);
          const value = Blot.get_value(found);
          quill.deleteText(index, value.length);
          quill.insertText(index, `@${item.label}`, { at: item.value });
          quill.focus();
        }
      }
    }
  }
  applyChange(cmds) {
    const { ui, quill } = this;
    cmds.forEach(({
      type, loc, len, content,
    }) => {
      switch (type) {
        case 'start':
          quill.updateContents(new Delta().retain(loc).retain(len, { ating: true }));
          break;
        case 'remove':
          quill.updateContents(new Delta().retain(loc).retain(len, { ating: false }));
          ui.stop();
          break;
        case 'close':
          ui.stop();
          break;
        case 'search':
          ui.start();
          ui.fetch(content);
          break;
        default:
      }
    });
  }
  getContentChange() {
    const { quill } = this;
    const result = [];

    const range = quill.getSelection();
    if (range) {
      const [leaf] = quill.getLeaf(range.index);
      if (leaf) {
        const found = AtingBlot.find_ating_blot(leaf);
        if (found) {
          const value = Blot.get_value(found);
          if (value.indexOf('@') === 0) {
            result.push({
              type: 'search',
              content: value.substr(1),
            });
          }
        }
      }
    }
    if (!result.length) {
      result.push({
        type: 'close',
      });
    }
    return result;
  }
  getFormatChange(delta) {
    const result = [];
    delta.reduce(([nowLoc, oldLoc], op) => {
      const { insert, retain, attributes } = op;
      if (retain) {
        nowLoc += retain;
        oldLoc += retain;
      }
      if (insert && typeof insert === 'string') {
        const len = insert.length;
        if (!attributes || !attributes.ating) {
          const match = insert.match(/@\S*/);
          if (match) {
            const loc = nowLoc + match.index;
            result.push({
              type: 'start',
              loc,
              len: match[0].length,
            });
          }
        } else {
          const match = insert.match(/^\s$/);
          if (match) {
            result.push({
              type: 'remove',
              loc: nowLoc + match.index,
              len: insert.length - match.index,
            });
          }
        }
        nowLoc += len;
      }
      if (op.delete) {
        oldLoc += op.delete;
      }
      return [nowLoc, oldLoc];
    }, [0, 0]);
    return result;
  }
}
