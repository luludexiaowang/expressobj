import Quill from 'quill';
// import cryptoRandomString from 'crypto-random-string';
import './index.less';

/* eslint-disable max-len */
const Container = Quill.import('blots/container');
// const Scroll = Quill.import('blots/scroll');
const Block = Quill.import('blots/block');
const BlockEmbed = Quill.import('blots/embed');
const Parchment = Quill.import('parchment');
const Delta = Quill.import('delta');

// function randomId() {
//   return cryptoRandomString(16);
// }


class RowBreak extends BlockEmbed {
  static blotName = 'trbr';
  static tagName = 'td';
  static className = 'trbr';
  formats() {
    return { trbr: true };
  }
}
Quill.register(RowBreak);

class CellBreak extends BlockEmbed {
  static blotName = 'tdbr';
  static tagName = 'td';
  static className = 'tdbr';
  formats() {
    return { tdbr: true };
  }
}
Quill.register(CellBreak);

class ContainBlot extends Container {
  static blotName = 'contain';
  static tagName = 'contain';
  static scope = Parchment.Scope.BLOCK_BLOT;
  static defaultChild = 'block';
  static allowedChildren = [Block, BlockEmbed, Container];
  static create() {
    const node = super.create(this.tagName);
    return node;
  }
  static formats(domNode) {
    return domNode.tagName;
  }

  insertBefore(blot, ref) {
    if (blot.statics.blotName === this.statics.blotName) {
      super.insertBefore(blot.children.head, ref);
    } else {
      super.insertBefore(blot, ref);
    }
  }
  formats() {
    return { [this.statics.blotName]: this.statics.formats(this.domNode) };
  }

  replace(target) {
    if (target.statics.blotName !== this.statics.blotName) {
      const item = Parchment.create(this.statics.defaultChild);
      target.moveChildren(item);
      this.appendChild(item);
    }
    if (target.parent == null) return;
    super.replace(target);
  }
}


class TableCell extends ContainBlot {
  static blotName = 'td';
  static tagName = 'td';
  static scope = Parchment.Scope.BLOCK_BLOT;
  static defaultChild = 'block';
  static allowedChildren = [Block, BlockEmbed, Container];

  format() {
    return 'td';
  }

  optimize() {
    super.optimize();
    const { parent } = this;
    if (parent != null && parent.statics.blotName !== 'tr') {
      this.processTR();
    }
    // merge same TD id
    const { next } = this;
    if (next != null && next.prev === this &&
      next.statics.blotName === this.statics.blotName &&
      next.domNode.tagName === this.domNode.tagName
    ) {
      next.moveChildren(this);
      next.remove();
    }
  }
  processTR() {
    let currentBlot = this;
    const rowItems = [this];
    while (currentBlot) {
      if (currentBlot.statics.tagName !== 'TD') {
        break;
      }
      rowItems.push(currentBlot);
      if (currentBlot instanceof RowBreak) {
        break;
      }
      currentBlot = currentBlot.next;
    }
    let cellItems = [];
    const cells = [];
    rowItems.forEach((rowItem) => {
      cellItems.push(rowItem);
      if (rowItem instanceof CellBreak) {
        cells.push(cellItems);
        cellItems = [];
      }
    });
    if (cellItems.length > 0) {
      cells.push(cellItems);
    }
    const mark = Parchment.create('block');
    this.parent.insertBefore(mark, this.next);
    // create row
    const row = Parchment.create('tr');
    cells.forEach((cell) => {
      // add row elements
      cell.forEach((cellItem) => {
        row.appendChild(cellItem);
      });
    });
    row.replace(mark);
  }
}
Quill.register(TableCell);

class TableRow extends Container {
  static blotName = 'tr';
  static tagName = 'tr';
  static scope = Parchment.Scope.BLOCK_BLOT;
  static defaultChild = 'td';
  static create() {
    debugger;
    const node = super.create(this.tagName);
    return node;
  }

  optimize() {
    super.optimize();
    const { parent } = this;
    if (parent && parent.statics.blotName !== 'table') {
      this.processTable();
    }
  }

  processTable() {
    let currentBlot = this;
    const rows = [];
    while (currentBlot) {
      if (!(currentBlot instanceof TableRow)) {
        break;
      }
      rows.push(currentBlot);
      currentBlot = currentBlot.next;
    }
    const mark = Parchment.create('block');
    this.parent.insertBefore(mark, this.next);
    const table = Parchment.create('table');
    rows.forEach((row) => {
      table.appendChild(row);
    });
    table.replace(mark);
  }
}
Quill.register(TableRow);

class Table extends Container {
  static blotName = 'table';
  static tagName = 'table';
  static scope = Parchment.Scope.BLOCK_BLOT;
  static defaultChild = 'tr';
  static allowedChildren = [TableRow];
  optimize() {
    super.optimize();
    const { next } = this;
    if (next != null && next.prev === this &&
      next.statics.blotName === this.statics.blotName &&
      next.domNode.tagName === this.domNode.tagName
    ) {
      next.moveChildren(this);
      next.remove();
    }
  }
}
Quill.register(Table);

function getClosestNewLineIndex(contents, index) {
  return index + contents.map((op) => {
    return typeof op.insert === 'string' ? op.insert : ' ';
  }).join('')
    .slice(index)
    .indexOf('\n');
}

export const tableHandlers = {
  table(value) {
    if (typeof value === 'string') {
      const r = /^newtable_(\d+)_(\d+)$/.exec(value);
      if (r) {
        const [, rows, columns] = r;
        // const table = Parchment.create('table');
        const range = this.quill.getSelection();
        if (!range) return;
        const newLineIndex = getClosestNewLineIndex(this.quill.getContents(), range.index + range.length);
        let changeDelta = new Delta().retain(newLineIndex);
        changeDelta = changeDelta.insert('\n');
        for (let i = 0; i < rows; i += 1) {
          for (let j = 0; j < columns; j += 1) {
            changeDelta = changeDelta.insert('\n', {
              td: true,
            });
            if (j < columns - 1) {
              changeDelta = changeDelta.insert({ tdbr: true });
            }
          }
          changeDelta = changeDelta.insert({ trbr: true });
        }
        debugger;
        this.quill.updateContents(changeDelta, Quill.sources.USER);
        this.quill.setSelection(newLineIndex + 1);
      }
    }
  },
};

Container.order = [
  'list', 'contain', // Must be lower
  'td', 'tr', 'table', // Must be higher
];

const ROWNUM = 5;
const COLNUM = 5;
const options = [];
new Array(ROWNUM)
  .fill(0)
  .forEach((row, i) =>
    new Array(COLNUM)
      .fill(0)
      .forEach((col, j) =>
        options.push(`newtable_${i + 1}_${j + 1}`)));
export const tableContainer = [
  [
    {
      table: options,
    },
  ],
];
