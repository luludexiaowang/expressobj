/* eslint-disable no-unused-vars,camelcase,max-len,no-mixed-operators */
import Quill from 'quill';

const Delta = Quill.import('delta');
const Parchment = Quill.import('parchment');
const Module = Quill.import('core/module');

export default class Indivisible extends Module {
  static moduleName = 'indivisible';
  static invisibleMap = {};
  static invisibleEnvMap = {};

  static is_loc_in_formats(quill, loc, formats) {
    // 位置在formats的中间
    const d1 = quill.getContents(loc - 1, 1);
    const d2 = quill.getContents(loc, 1);
    const ops1 = d1.ops;
    const ops2 = d2.ops;
    if (ops1.length !== 1 || ops1.length !== ops2.length) {
      return false;
    }
    const attrs1 = ops1[0].attributes || {};
    const attrs2 = ops2[0].attributes || {};
    return formats.reduce((result, format) => {
      if (attrs1[format] || attrs2[format]) {
        if (attrs1[format] === attrs2[format]) {
          result = true;
        }
      }
      return result;
    }, false);
  }
  static is_selection_include_formats_fragment(quill, formats) {
    // 选区中包含formats片段
    const range = quill.getSelection();
    const locs = [range.index];
    if (range.length) {
      locs.push(range.index + range.length);
    }
    return locs.every(loc => this.is_loc_in_formats(quill, loc, formats));
  }
  static is_selection_left_in_formats(quill, formats) {
    // 选区左侧是formats
    const range = quill.getSelection();
    const { ops } = quill.getContents(range.index - 1, 1);
    if (ops.length < 1) {
      return false;
    }
    const attrs = ops[0].attributes || {};
    return !formats.every(format => {
      return !attrs[format];
    });
  }
  static can_not_add_invisible(quill) {
    const focus = quill.hasFocus();
    if (!focus) {
      return true;
    }
    const a = this.is_selection_include_formats_fragment(quill, Object.keys(this.invisibleMap));
    const b = this.is_selection_include_formats_fragment(quill, Object.keys(this.invisibleEnvMap));
    const c = this.is_selection_left_in_formats(quill, Object.keys(this.invisibleEnvMap));
    return a || b || !b && c;
  }
  static can_add_invisible(quill) {
    return !this.can_not_add_invisible(quill);
  }

  static get_blot_invisible_option(blotName) {
    let option = null;
    if (blotName) {
      option = this.invisibleMap[blotName];
    }
    return option;
  }

  static find_indivisible(blot) {
    let found = null;
    while (blot) {
      if (this.invisibleMap[blot.statics.blotName]) {
        found = blot;
        break;
      }
      blot = blot.parent;
    }
    return found;
  }
  static get_op_indivisible_format(op) {
    const { attributes } = op;
    if (attributes) {
      let result = null;
      Object.keys(this.invisibleMap).every(blotName => {
        if (attributes[blotName] !== undefined) {
          result = blotName;
          return false;
        }
        return true;
      });
      return result;
    }
    return null;
  }
  static is_op_indivisible(op) {
    const { attributes } = op;
    if (attributes) {
      return !Object.keys(this.invisibleMap)
        .every(blotName => {
          if (attributes[blotName] !== undefined) {
            return false;
          }
          return true;
        });
    }
    return false;
  }

  static get_intersect_range(r1, r2) {
    const result = {
      left: Math.max(r1.left, r2.left),
      right: Math.min(r1.right, r2.right),
    };
    if (result.left < result.right) {
      return result;
    }
    return null;
  }

  static get_reverse_delta(type, oldDelta, nowLeft, nowRight, oldLeft, oldRight, afterReverseDetaLen, format, formatValue, nowOp) {
    const result = [];

    if (type === 'insert') {
      const len = nowRight - nowLeft;
      let isAppend = false;
      if (format && formatValue) {
        oldDelta.reduce((left, op) => {
          const { insert, attributes } = op;
          const right = left + insert.length;
          if (attributes && attributes[format] === formatValue) {
            if (right === nowLeft) {
              isAppend = true;
            }
          }
          return right;
        }, 0);
      }
      if (isAppend) {
        const nowOpInsert = nowOp.insert;
        const nowOpAttributes = nowOp.attributes;
        delete nowOpAttributes[format];
        result.push(new Delta().retain(nowLeft + afterReverseDetaLen)
          .insert(nowOpInsert, nowOpAttributes)
          .delete(nowOpInsert.length));
      } else {
        result.push(new Delta().retain(nowLeft + afterReverseDetaLen)
          .delete(len));
        afterReverseDetaLen += -(len);
      }
    } else {
      oldDelta.reduce((left, op) => {
        const { insert, attributes } = op;
        const right = left + insert.length;
        const ins = this.get_intersect_range({ left: oldLeft, right: oldRight }, { left, right });
        if (ins && (ins.left !== left || ins.right !== right)) {
          if (type === 'delete' && this.is_op_indivisible(op)) {
            result.push(new Delta()
              .retain(nowLeft + afterReverseDetaLen)
              .insert(insert.substr(ins.left - left, ins.right - ins.left), attributes));
            afterReverseDetaLen += ins.right - ins.left;
          } else if (type === 'retain') {
            result.push(new Delta()
              .retain(nowLeft + afterReverseDetaLen)
              .insert(insert.substr(ins.left - left, ins.right - ins.left), attributes)
              .delete(ins.right - ins.left));
          }
        }
        return right;
      }, 0);
    }
    return [result, afterReverseDetaLen];
  }
  static get_reverse_deltas(delta, oldDelta) {
    let result = [];
    delta.reduce(([nowLeft, oldLenDeta, afterReverseDetaLen], op) => {
      const { retain, insert } = op;
      let nowRight = nowLeft;
      const oldLeft = nowLeft + oldLenDeta;
      let oldRight = nowRight + oldLenDeta;
      let reverseArgs = [];
      const format = this.get_op_indivisible_format(op);
      if (retain !== undefined) {
        nowRight += retain;
        oldRight += retain;
        if (format) {
          reverseArgs.push('retain');
        }
      } else if (insert !== undefined) {
        nowRight += insert.length;
        oldLenDeta -= insert.length;
        if (format) {
          reverseArgs.push('insert');
        }
      } else {
        oldRight += op.delete;
        oldLenDeta += op.delete;
        reverseArgs.push('delete');
      }
      if (reverseArgs.length) {
        reverseArgs = reverseArgs
          .concat([oldDelta, nowLeft, nowRight, oldLeft, oldRight, afterReverseDetaLen, format, format && op.attributes[format], op]);
        const [resultDeta, newAfterReverseDetaLen]
          = this.get_reverse_delta(...reverseArgs);
        afterReverseDetaLen = newAfterReverseDetaLen;
        result = result.concat(resultDeta);
      }

      return [nowRight, oldLenDeta, afterReverseDetaLen];
    }, [0, 0, 0]);
    return result;
  }
  constructor(quill, options) {
    super(quill, options);
    quill.indivisible = this;
    const { keyboard } = quill;
    keyboard.addBinding({ key: 8, collapsed: true }, (range) => {
      return this.delete(range);
    });
    quill.on('text-change', (delta, oldDelta, source) => {
      if (source === 'user') {
        this.reverse(delta, oldDelta);
      }
    });
  }
  delete(range) {
    const { quill } = this;
    const [leaf] = quill.getLeaf(range.index);
    if (leaf) {
      const blot = Indivisible.find_indivisible(leaf);
      if (blot) {
        const option = Indivisible.get_blot_invisible_option(blot.statics.blotName);
        if (option) {
          if (option.deleteAll) {
            let parent = null;
            if (!blot.prev && !blot.next) {
              ({ parent } = blot);
            }
            blot.remove();
            if (parent) {
              parent.insertBefore(Parchment.create('break'));
            }
            return false;
          }
        }
      }
    }
    return true;
  }
  reverse(delta, oldDelta) {
    const { quill } = this;
    const reverseDeltas = Indivisible.get_reverse_deltas(delta, oldDelta);
    reverseDeltas.forEach(item => {
      quill.updateContents(item);
    });
  }
}

