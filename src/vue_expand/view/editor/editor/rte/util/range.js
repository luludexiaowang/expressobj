/* eslint-disable camelcase */

export default class Range {
  static RELATION_TYPE = {
    UNKNOW: -1,
    INDEPENDENT: 0,
    INTERSECT: 1,
    INTERSECT_AND_RIGHT_INCLUDE_LEFT: 2,
    INTERSECT_AND_LEFT_INCLUDE_RIGHT: 3,
    INTERSECT_AND_EQUAL: 4,
  };
  static get_relation(r1, r2) {
    const {
      RELATION_TYPE: {
        UNKNOW,
        INDEPENDENT,
        INTERSECT,
        INTERSECT_AND_RIGHT_INCLUDE_LEFT,
        INTERSECT_AND_LEFT_INCLUDE_RIGHT,
        INTERSECT_AND_EQUAL,
      },
    } = this;
    if (!(r1 instanceof this) || !(r2 instanceof this)) {
      return [UNKNOW];
    }
    const sum = {
      left: Math.max(r1.left, r2.left),
      right: Math.min(r1.right, r2.right),
    };
    sum.len = sum.right - sum.left;
    if (sum.left < sum.right) {
      let type = INTERSECT;
      if (r1.left === r2.left && r1.right === r2.right) {
        type = INTERSECT_AND_EQUAL;
      } else if (r1.left === sum.left && r1.right === sum.right) {
        type = INTERSECT_AND_RIGHT_INCLUDE_LEFT;
      } else if (r2.left === sum.left && r2.right === sum.right) {
        type = INTERSECT_AND_LEFT_INCLUDE_RIGHT;
      }
      return [type, sum];
    }
    return [INDEPENDENT];
  }
  constructor(left, len) {
    this.left = left;
    this.len = len;
    this.right = left + len;
  }
}
