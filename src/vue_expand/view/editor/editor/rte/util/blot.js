import Quill from 'quill';
/* eslint-disable camelcase */
const Parchment = Quill.import('parchment');
const { Leaf, Container, Block } = Parchment;

export default class Blot {
  static get_value(blots) {
    if (!blots.reduce) {
      blots = [blots];
    }
    return blots.reduce((r, blot) => {
      if (blot instanceof Leaf) {
        return r + blot.value();
      } else if (blot instanceof Container) {
        return r + this.get_value(blot.children);
      }
      return r;
    }, '');
  }
  static get_index(blot) {
    if (blot) {
      const { parent } = blot;
      if (parent) {
        const next = parent.children.iterator();
        let len = 0;
        let cur = next();
        while (cur) {
          if (cur === blot) {
            break;
          }
          if (cur instanceof Block) {
            len += 1;
          }
          const value = this.get_value(cur);

          len += value ? value.length : 0;
          cur = next();
        }
        return this.get_index(parent) + len;
      }
    }
    return 0;
  }
  constructor(blot) {
    this.blot = blot;
  }
}
