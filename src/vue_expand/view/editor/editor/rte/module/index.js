/* eslint-disable no-unused-vars */

import Quill from 'quill';
import Indivisible from './indivisible';
import At from './at';
import Link from './link';
// import Debug from './debug';

const QuillModule = Quill.import('core/module');

export default class Extension extends QuillModule {
  static Modules = [Indivisible, At, Link];
  constructor(quill, options) {
    super(quill, options);
    Extension.Modules.forEach(Module => {
      const { moduleName } = Module;
      this[moduleName] = new Module(quill, options[moduleName]);
    });
  }
}
Quill.register('modules/extension', Extension);

