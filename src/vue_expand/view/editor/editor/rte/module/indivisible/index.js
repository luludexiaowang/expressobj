/* eslint-disable no-unused-vars,camelcase,max-len,no-mixed-operators,no-shadow,no-bitwise,max-statements */
import Quill from 'quill';
import Range from '../../util/range';

const Delta = Quill.import('delta');
const Module = Quill.import('core/module');

class Attr {
  static get_attr_by_keys(keys, op) {
    const { attributes } = op;
    if (attributes) {
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        const result = this.get_attr(key, op);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }
  static get_attr(key, op) {
    const { attributes } = op;
    if (attributes && attributes.hasOwnProperty(key)) {
      return new Attr(key, attributes[key]);
    }
    return null;
  }
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
  equal(attr) {
    if (!(attr instanceof Attr)) {
      return false;
    }
    return attr.key === this.key && attr.value === this.value;
  }
}
class AttrOp {
  static get_aops(delta, key) {
    const [result] = delta.reduce(([result, left], op) => {
      const { insert } = op;
      const attr = Attr.get_attr(key, op);
      if (attr) {
        const last = result[result.length - 1];
        if (last && last.equal(attr)) {
          last.append(insert);
        } else {
          result.push(new AttrOp(insert, attr, left));
        }
      }
      return [result, left + insert.length];
    }, [[], 0]);
    return result;
  }
  static some(keys, delta, cb) {
    return keys.some(key => {
      const data = this.get_aops(delta, key);
      return data.some(item => {
        return cb(item);
      });
    });
  }
  static loc_in_some(keys, delta, loc) {
    const cb = (item) => {
      return item.left < loc && item.right() > loc;
    };
    return this.some(keys, delta, cb);
  }
  static loc_right_some(keys, delta, loc) {
    const cb = (item) => {
      return item.right() === loc;
    };
    return this.some(keys, delta, cb);
  }
  static fragment_in_some(keys, delta, range) {
    const cb = (item) => {
      const [relation, detail] = item.relation(range);
      return relation > 0 && (detail.left > item.left || detail.right < item.right());
    };
    return this.some(keys, delta, cb);
  }
  constructor(insert, attr, left) {
    this.insert = insert;
    this.attr = attr;
    this.left = left;
  }
  length() {
    return this.insert.length;
  }
  right() {
    return this.left + this.length();
  }
  range() {
    return new Range(this.left, this.length());
  }
  append(value) {
    this.insert += value;
  }
  equal(attr) {
    return this.attr.equal(attr);
  }
  relation(range) {
    return Range.get_relation(range, this.range());
  }
}
class IAttrOp {
  static get_iaops(range, aops) {
    return aops.reduce((result, aop) => {
      const [relation, detail] = aop.relation(range);
      if (relation > 0) {
        result.push(new IAttrOp(aop, new Range(detail.left, detail.len)));
      }
      return result;
    }, []);
  }
  static some_rightest(iaops) {
    return iaops.some((iaop) => {
      return iaop.rightest;
    });
  }
  static some_leftest(iaops) {
    return iaops.some((iaop) => {
      return iaop.leftest;
    });
  }
  constructor(aop, range) {
    this.aop = aop;
    this.range = range;
    if (range.left > aop.left || range.right < aop.right()) {
      this.full = false;
    } else {
      this.full = true;
    }
    if (range.left === aop.left) {
      this.leftest = true;
    } else {
      this.leftest = false;
    }
    if (range.right === aop.right()) {
      this.rightest = true;
    } else {
      this.rightest = false;
    }
  }
}
class RangeOp {
  static get_rops(delta, range) {
    const [, result] = delta.reduce(([left, result], op) => {
      const { insert, attributes } = op;
      const nRange = new Range(left, insert.length);
      const [relation, detail] = Range.get_relation(nRange, range);
      if (relation > 0) {
        result.push(new RangeOp(op, nRange, {
          attributes,
          insert: insert.substr(detail.left - left, detail.len),
        }, new Range(detail.left, detail.len)));
      }
      return [nRange.right, result];
    }, [0, []]);
    return result;
  }
  static get_attr_rops(rops, keys) {
    return rops.reduce((result, rop) => {
      const {
        extra, iop, range, iRange,
      } = rop;
      const attr = Attr.get_attr_by_keys(keys, iop);
      if (attr) {
        extra.attr = attr;
        const [relation] = Range.get_relation(range, iRange);
        extra.all = (relation === Range.RELATION_TYPE.INTERSECT_AND_EQUAL);
        result.push(rop);
      }
      return result;
    }, []);
  }
  constructor(op, range, iop, iRange) {
    this.op = op;
    this.range = range;
    this.iop = iop;
    this.iRange = iRange;
    this.extra = {};
  }
}
class ReverseOp {
  static apply(quill, rops, selection) {
    const deta = rops.reduce((deta, rop) => {
      let delta = null;
      ([delta, deta] = rop.delta(deta));
      quill.updateContents(delta);
      return deta;
    }, 0);
    if (deta && selection) {
      quill.setSelection(Math.max(selection.index + deta, 0), 0, 'silent');
    }
  }
  constructor(type, range, args) {
    this.type = type;
    this.range = range;
    this.args = args;
  }
  delta(deta = 0) {
    const { type, range, args } = this;
    const result = new Delta().retain(range.left + deta);
    switch (type) {
      case 'remove':
        result.retain(range.len, { [args.key]: false });
        break;
      case 'delete':
        result.delete(range.len);
        deta -= range.len;
        break;
      case 'reset':
        result.retain(range.len, { [args.key]: args.value });
        break;
      case 'insert':
        result.insert(args.insert, args.attributes);
        deta += args.insert.length;
        break;
      default:
    }
    return [result, deta];
  }
}
export const bindings = [

];
export default class Indivisible extends Module {
  static moduleName = 'indivisible';
  static invisibleMap = {};
  static invisibleEnvMap = {};

  static get_option(key) {
    return this.invisibleMap[key];
  }

  constructor(quill, options) {
    super(quill, options);
    quill.indivisible = this;
    quill.on('text-change', (delta, oldDelta, source) => {
      if (source === 'user') {
        const range = quill.getSelection();
        const nowDelta = quill.getContents();
        setTimeout(() => {
          this.reverse(delta, nowDelta, oldDelta, range);
        }, 0);
      }
    });
    const { keyboard } = quill;
    keyboard.addBinding({ key: 8, collapsed: true }, (selection) => {
      return this.delete(selection);
    });
    const last = keyboard.bindings[8].pop();
    keyboard.bindings[8].unshift(last);
  }

  delete(selection) {
    const { quill } = this;
    const delta = quill.getContents();
    const range = new Range(selection.index - 1, 1);
    const rops = RangeOp.get_rops(delta, range);
    if (rops.length) {
      const [{ op }] = rops;
      const attr = Attr.get_attr_by_keys(Object.keys(Indivisible.invisibleMap), op);
      if (attr) {
        const option = Indivisible.get_option(attr.key);
        if (option.allowKeyboardDelete) {
          const iaops = IAttrOp.get_iaops(range, AttrOp.get_aops(delta, attr.key));
          if (iaops.length) {
            const [{ aop }] = iaops;
            quill.updateContents(new Delta().retain(aop.left).delete(aop.length()));
            return false;
          }
        }
      }
    }
    return true;
  }

  can_add() {
    const { quill } = this;
    let range = quill.getSelection();
    if (!range) {
      return false;
    }
    range = new Range(range.index, range.length);
    const delta = quill.getContents();
    const keys = Object.keys(Indivisible.invisibleMap);
    const envKeys = Object.keys(Indivisible.invisibleEnvMap);
    const allKeys = keys.concat(envKeys);
    if (range.len) {
      return !AttrOp.fragment_in_some(allKeys, delta, range);
    }
    if (AttrOp.loc_in_some(allKeys, delta, range.left)) {
      return false;
    }
    return !AttrOp.loc_right_some(envKeys, delta, range.left);
  }

  reverse(delta, nowDelta, oldDelta, selection) {
    // todo: 解决快速输入问题
    const { quill } = this;
    const keys = Object.keys(Indivisible.invisibleMap);
    const [,, rops] = delta.reduce(([nl, ol, result], op) => {
      let nr = nl;
      let or = ol;
      const { insert, retain } = op;
      const delet = op.delete;
      if (insert) {
        nr += insert.length;
        const range = new Range(nl, nr - nl);
        const attr = Attr.get_attr_by_keys(keys, op);
        if (attr) {
          const aops = AttrOp.get_aops(nowDelta, attr.key);
          const oldAops = AttrOp.get_aops(oldDelta, attr.key);
          const iaops = IAttrOp.get_iaops(range, aops);
          if (iaops.length) {
            const leftest = IAttrOp.some_leftest(iaops);
            const rightest = IAttrOp.some_rightest(iaops);
            if (leftest !== rightest) {
              if (leftest) {
                const oldIaops = IAttrOp.get_iaops(new Range(ol - 1, 1), oldAops);
                if (!oldIaops.length || !oldIaops[0].aop.attr.equal(attr)) {
                  // remove
                  result.push(new ReverseOp('remove', iaops[0].range, iaops[0].aop.attr));
                } else {
                  // delete
                  result.push(new ReverseOp('delete', iaops[0].range));
                }
              } else {
                const oldIaops = IAttrOp.get_iaops(new Range(ol, ol + 1), oldAops);
                if (!oldIaops.length || !oldIaops[0].aop.attr.equal(attr)) {
                  // remove
                  result.push(new ReverseOp('remove', iaops[0].range, iaops[0].aop.attr));
                } else {
                  // delete
                  result.push(new ReverseOp('delete', iaops[0].range));
                }
              }
            } else {
              // delete
              result.push(new ReverseOp('delete', iaops[0].range));
            }
          }
        } else {
          // todo: 保证indivisible中不能插入indivisible
          const rops = RangeOp.get_rops(nowDelta, new Range(nl - 1, nr - nl + 2));
          if (rops.length === 3) {
            const attr1 = Attr.get_attr_by_keys(keys, rops[0].op);
            const attr2 = Attr.get_attr_by_keys(keys, rops[2].op);
            if (attr1 && attr1.equal(attr2)) {
              result.push(new ReverseOp('delete', range));
            }
          }
        }
      } else if (retain) {
        nr += retain;
        or += retain;
        const range = new Range(nl, nr - nl);
        const attr = Attr.get_attr_by_keys(keys, op);
        if (attr) {
          if (attr.key && attr.value) {
            // remove
            result.push(new ReverseOp('remove', range, attr));
          } else {
            // reset
            const aops = AttrOp.get_aops(oldDelta, attr.key);
            const iaops = IAttrOp.get_iaops(new Range(ol, or - ol), aops);
            if (iaops.length) {
              result.push(new ReverseOp('reset', range, iaops[0].aop.attr));
            }
          }
        }
      } else if (delet) {
        or += delet;
        const range = new Range(ol, or - ol);
        const rops = RangeOp.get_attr_rops(RangeOp.get_rops(oldDelta, range), keys);
        rops.forEach(rop => {
          // insert
          const { extra: { all, attr }, iop } = rop;
          if (Indivisible.get_option(attr.key).allowAllDelete) {
            if (all) {
              return;
            }
          }
          result.push(new ReverseOp('insert', new Range(nl, 0), iop));
        });
      }
      return [nr, or, result];
    }, [0, 0, []]);
    ReverseOp.apply(quill, rops, selection);
  }
}

