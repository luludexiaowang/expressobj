import Quill from 'quill';
import Ui from './ui/index.js';

const Module = Quill.import('core/module');

export default class Debug extends Module {
  static moduleName = 'debug';
  constructor(quill, options) {
    super(quill, options);
    quill.debug = this;
    this.ui = new Ui({
      container: quill.container,
    });
    this.ui.setContent('nowDelta', quill.getContents());
    quill.on('text-change', (delta) => {
      this.ui.setContent('nowDelta', quill.getContents());
      this.ui.setContent('changeDelta', delta);
    });
  }
}
