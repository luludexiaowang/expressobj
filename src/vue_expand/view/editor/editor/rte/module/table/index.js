/* eslint-disable max-len,no-mixed-operators,camelcase,no-shadow,no-cond-assign,no-loop-func,no-unused-vars */
import Quill from 'quill';
import cryptoRandomString from 'crypto-random-string';
import './index.less';
import Indivisible from '../indivisible';

const Scroll = Quill.import('blots/scroll');
const Block = Quill.import('blots/block');
const Parchment = Quill.import('parchment');
const Container = Quill.import('blots/container');

class TdBlot extends Container {
  static blotName = 'td';
  static tagName = 'td';
  static scope = Parchment.Scope.BLOCK_BLOT;
  // static defaultChild = 'block';

  static create(value) {
    const ids = value.split('|');
    const node = super.create(this.tagName);
    node.setAttribute('table_id', ids[0]);
    node.setAttribute('tr_id', ids[1]);
    node.setAttribute('td_id', ids[2]);
    node.setAttribute('td_count', ids[3]);
    node.style.width = `${Math.floor(10000 / ids[3]) / 100}%`;
    return node;
  }
}
Quill.register(TdBlot);

class TrBlot extends Container {
  static blotName = 'tr';
  static tagName = 'tr';
  static scope = Parchment.Scope.BLOCK_BLOT;
  static allowedChildren = [TdBlot];

  static create(value) {
    const ids = value.split('|');
    const node = super.create(this.tagName);
    node.setAttribute('table_id', ids[0]);
    node.setAttribute('tr_id', ids[1]);
    return node;
  }
}
Quill.register(TrBlot);

export class TableBlot extends Container {
  static blotName = 'table';
  static tagName = 'table';
  static scope = Parchment.Scope.BLOCK_BLOT;
  static allowedChildren = [TrBlot];

  static create(value) {
    const node = super.create(this.tagName);
    node.setAttribute('table_id', value);
    return node;
  }
}
Quill.register(TableBlot);

class Tag extends Block {
  static create(value) {
    const ids = value.split('|');
    const node = super.create(this.tagName);
    node.setAttribute('table_id', ids[0]);
    node.setAttribute('tr_id', ids[1]);
    node.setAttribute('td_id', ids[2]);
    node.setAttribute('td_count', ids[3]);
    return node;
  }

  static formats(domNode) {
    if (domNode.tagName === this.tagName) {
      return `${domNode.getAttribute('table_id')}|${domNode.getAttribute('tr_id')}|${domNode.getAttribute('td_id')}|${domNode.getAttribute('td_count')}`;
    }
    return super.formats(domNode);
  }

  static typeInfo = {
    table: {
      cls: TableBlot,
      attrs: ['table_id'],
    },
    tr: {
      cls: TrBlot,
      attrs: ['table_id', 'tr_id'],
    },
    td: {
      cls: TdBlot,
      attrs: ['table_id', 'tr_id', 'td_id', 'td_count'],
    },
  };

  static get_format(blot, type) {
    let result = null;
    const info = (typeof type === 'string') ? this.typeInfo[type] : type;
    if (info) {
      const { attrs } = info;
      const { domNode } = blot;
      result = attrs.reduce((result, attr) => {
        const value = domNode.getAttribute(attr);
        if (result && value) {
          result.push(value);
        } else {
          result = null;
        }
        return result;
      }, []);
      return result && result.join('|');
    }
    return result;
  }

  static is_format(blot, type, format) {
    const info = (typeof type === 'string') ? this.typeInfo[type] : type;
    if (info) {
      const { cls } = info;
      if (blot instanceof cls) {
        return this.get_format(blot, type) === format;
      }
    }
    return false;
  }

  static find_format_blot(blot, type, format) {
    if (!blot) return null;
    if (this.is_format(blot, type, format)) {
      return blot;
    }
    if (blot instanceof Parchment.Container) {
      const { children } = blot;
      const iter = children.iterator();
      let now = null;
      while (now = iter()) {
        const found = this.find_format_blot(now, type, format);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  static find_blot_by_parent(blot, Clss) {
    if (!blot) return [];
    let parent = blot;
    let child = null;
    while (parent && !Clss.some(Cls => {
      if (parent instanceof Cls) {
        return true;
      }
      return false;
    })) {
      child = parent;
      ({ parent } = parent);
    }
    return [parent, child];
  }

  static find_blot_by_children(blot, Clss) {
    if (!blot) return null;
    if (blot instanceof Parchment.Container) {
      const { children } = blot;
      const iter = children.iterator();
      let now = null;
      while (now = iter()) {
        if (Clss.some(Cls => {
          if (now.constructor === Cls) {
            return true;
          }
          return false;
        })) {
          return now;
        }
      }
    }
    return null;
  }

  static is_children_form(blot, Clss) {
    if (!(blot instanceof Container)) {
      return false;
    }
    if (!Array.isArray(Clss)) {
      return true;
    }
    let result = true;
    blot.children.reduce((i, child) => {
      const Cls = Clss[i];
      if (!Cls) {
        result = false;
      } else if (!(child instanceof Cls)) {
        result = false;
      }
      return i + 1;
    }, 0);
    return result;
  }

  position(index) {
    let offset = [].indexOf.call(this.parent.domNode.childNodes, this.domNode);
    if (index > 0) offset += 1;
    return [this.parent.domNode, offset];
  }
}

class TdStartBlot extends Tag {
  static blotName = 'td_start';
  static className = 'td-start';

  optimize(context) {
    const tdFormat = this.statics.get_format(this, 'td');
    const trFormat = this.statics.get_format(this, 'tr');
    const tableFormat = this.statics.get_format(this, 'table');
    const { parent } = this;
    if (!this.statics.is_format(parent, 'td', tdFormat)) {
      const blots = [];
      let end = null;
      parent.children.forEach(child => {
        if (child === this) {
          blots.push(child);
        } else if (blots.length && !end) {
          blots.push(child);
        }
        if (this.statics.is_format(child, {
          ...Tag.typeInfo.td,
          cls: TdEndBlot,
        }, tdFormat)) {
          end = child;
        }
      });
      if (end) {
        const [root, anc] = this.statics.find_blot_by_parent(this, [Scroll, TdBlot]);
        if (root) {
          let table = this.statics.find_format_blot(root, 'table', tableFormat);
          if (!table) {
            table = Parchment.create('table', tableFormat);
            root.insertBefore(table, anc);
          }
          let tr = this.statics.find_format_blot(table, 'tr', trFormat);
          if (!tr) {
            tr = Parchment.create('tr', trFormat);
            table.appendChild(tr);
          }
          let td = this.statics.find_format_blot(tr, 'td', tdFormat);
          if (!td) {
            td = Parchment.create('td', tdFormat);
            tr.appendChild(td);
          }
          blots.forEach(blot => {
            td.appendChild(blot);
          });
          let block = this.statics.find_blot_by_children(td, [Block]);
          if (!block) {
            block = TableController.create_block();
            td.appendChild(block);
          }
          td.insertBefore(this, block);
          /*
           if (!this.statics.is_children_form(this, [Break])) {
           const block = Parchment.create('block');
           this.children.forEach(child => block.appendChild(child));
           if (blotName === 'td_start') {
           if (!this.next) {
           td.appendChild(block);
           } else {
           td.insertBefore(block, this.next);
           }
           } else {
           td.insertBefore(block, this);
           }
           this.appendChild(Parchment.create('break'));
           }
           const found = this.statics.find_blot_by_children(parent, [this.constructor]);
           if (found !== this) {
           this.remove();
           } */
        }
      } else {
        this.remove();
      }
    }
    super.optimize(context);
  }
}
Quill.register(TdStartBlot);

class TdEndBlot extends Tag {
  static blotName = 'td_end';
  static className = 'td-end';
}
Quill.register(TdEndBlot);

export class TableController {
  constructor(quill) {
    this.quill = quill;
  }
  random_id() {
    return cryptoRandomString(8);
  }
  insert(blots) {
    const { quill } = this;
    const sel = quill.getSelection();
    const [leaf] = quill.getLeaf(sel.index);
    const [root, anc] = Tag.find_blot_by_parent(leaf, [Scroll, TdBlot]);
    if (root) {
      blots.forEach(blot => {
        if (anc && anc.next) {
          root.insertBefore(blot, anc.next);
        } else {
          root.appendChild(blot);
        }
      });
    }
  }
  static create_block() {
    const block = Parchment.create('block');
    block.appendChild(Parchment.create('break'));
    return block;
  }

  editable() {
    const { quill } = this;
    if (quill) {
      const sel = quill.getSelection();
      if (sel) {
        const [leaf] = quill.getLeaf(sel.index);
        if (leaf && !Tag.find_blot_by_parent(leaf, [TdBlot])[0]) {
          return 'YES';
        }
        return 'NO';
      }
    }
    return null;
  }

  backspace_collpased(range) {
    const { quill } = this;
    const [leaf] = quill.getLeaf(range.index - 1);
    const { parent } = leaf;
    if (parent instanceof TdStartBlot || parent instanceof TdEndBlot) {
      return false;
    }
    return true;
  }

  create(size) {
    const { quill } = this;
    if (quill) {
      const sizes = /^(\d+)x(\d+)$/.exec(size);
      const [, row, col] = sizes;
      const tableId = this.random_id();
      const table = Parchment.create('table', tableId);
      for (let i = 0; i < row; i += 1) {
        const rowId = this.random_id();
        const tr = Parchment.create('tr', `${tableId}|${rowId}`);
        table.appendChild(tr);
        for (let j = 0; j < col; j += 1) {
          const colId = this.random_id();
          const fullId = `${tableId}|${rowId}|${colId}|${col}`;
          const td = Parchment.create('td', fullId);
          const tdStart = Parchment.create('td_start', fullId);
          tdStart.appendChild(Parchment.create('break'));
          td.appendChild(tdStart);
          const block = TableController.create_block();
          td.appendChild(block);
          const tdEnd = Parchment.create('td_end', fullId);
          tdEnd.appendChild(Parchment.create('break'));
          td.appendChild(tdEnd);
          tr.appendChild(td);
        }
      }
      this.insert([table]);
      if (!table.prev) {
        table.parent.insertBefore(TableController.create_block(), table);
      }
      if (!table.next) {
        table.parent.appendChild(TableController.create_block());
      }
    }
  }
}
