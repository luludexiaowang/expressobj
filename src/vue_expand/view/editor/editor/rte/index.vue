<template>
  <div :class="[$style.root,{'ql-app':inApp}]" ref="root">
      <div class="ql-editor" :class="$style.placeholder" v-show="placeholderVisible">
        <p>{{placeholder}}</p>
      </div>
      <div :class="$style.editor" ref="editor"/>
  </div>
</template>
<script>
  /* eslint-disable no-unused-vars,no-shadow */
  import EventEmitter from 'wolfy87-eventemitter';
  import MarkdownIt from 'markdown-it';
  import $ from 'jquery';
  import Quill from 'quill';
  import Keyboard from 'quill/modules/keyboard';
  import 'quill/dist/quill.snow.css';
  import './module';
  import './format';
  import Indivisible from './module/indivisible';
  import { TableController } from './module/table';
  import config from '../config';
  import { defaultSelectedColor } from '../config/color';
  import './index.less';
  import event from '../config/event';

  const md = new MarkdownIt({
    html: true,
    breaks: true,
  });

  /* eslint-disable max-len */
  export default{
    mixins: [],
    props: {
      emitter: {
        type: EventEmitter,
        default: () => new EventEmitter(),
      },
      atConfig: {
        type: Object,
        default: () => {
          return {};
        },
      },
      placeholder: {
        type: String,
        default: '',
      },
      role: String,
    },
    components: {},
    data() {
      this.events = null;
      return {
        inApp: window.inApp,
        quill: null,
        config,
        placeholderVisible: true,
        tableController: null,
        tableDisabled: true,
        linkDisabled: true,
      };
    },
    computed: {},
    methods: {
      init() {
        let quill = null;
        const { emitter, role } = this;
        const initQuill = () => {
          const { $refs: { editor, root }, atConfig } = this;
          const bindings = {};
          if (role === 'md') {
            const notNeedRemove = ['tab'];
            const defaultBindings = Keyboard.DEFAULTS.bindings;
            Object.keys(defaultBindings)
              .forEach(key => {
                if (!notNeedRemove.find((item) => item === key)) {
                  bindings[key] = {
                    ...defaultBindings[key],
                    handler() {
                      return true;
                    },
                  };
                }
              });
          }
          quill = new Quill(editor, {
            bounds: root,
            modules: {
              toolbar: {
                container: [
                  ['bold', 'italic', 'underline'],
                  [{ header: [1, 2, 3, 4, 5, 6, 7, 8] }, { color: config.color }],
                  [{ align: [] }],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link'],
                ],
              },
              extension: {
                at: atConfig,
              },
              keyboard: {
                bindings: {
                  ...bindings,
                  backspace_collpased: {
                    key: 8,
                    collapsed: true,
                    handler: (range) => {
                      return this.tableController.backspace_collpased(range);
                    },
                  },
                },
              },
            },
            theme: 'snow',
          });
          this.quill = quill;
          quill.clipboard.matchers = this.quill.clipboard.matchers.slice(0, 4);
          quill.emt = emitter;
          this.tableController = new TableController(quill);

          this.setPlaceholderVisible();
        };
        const addEvents = () => {
          quill.root.addEventListener('focus', () => {
            emitter.emit(event.RTE_FOCUS);
          });
          quill.root.addEventListener('blur', () => {
            setTimeout(() => {
              emitter.emit(event.RTE_BLUR);
            }, 0);
          });
          quill.on('editor-change', () => {
            this.setPlaceholderVisible();
          });
          quill.on('text-change', () => {
            this.$emit('text-change', quill.getContents());
          });

          if (role === 'rte') {
            emitter.on(event.TB_FORMAT, (...args) => {
              this.format(...args);
            });
            emitter.on(event.TB_FOCUS_TRANSFER, () => {
              quill.focus();
            });
            emitter.on(event.EDT_BLUR, () => {
              this.tableDisabled = true;
              this.linkDisabled = true;
              this.updateTb(false);
            });
            emitter.on(event.LINK_ADD, (target) => {
              quill.link.ui.show(target, '', 'https://', null, this.addLink.bind(this));
            });
            emitter.on(event.LINK_UPDATE, (...args) => {
              quill.link.ui.show(...args, this.updateLink.bind(this), this.removeLink.bind(this));
            });
            quill.on('editor-change', () => {
              const focus = quill.hasFocus();
              if (focus) {
                const { indivisible } = quill;
                if (indivisible.can_add()) {
                  this.linkDisabled = false;
                } else {
                  this.linkDisabled = true;
                }
                const editable = this.tableController.editable();
                if (editable) {
                  this.tableDisabled = (editable === 'NO');
                }
              }
              this.updateTb(focus);
            });
            this.notify(event.RTE_READY);
          } else if (role === 'md') {
            this.notify(event.MD_READY);
          }
        };

        initQuill();
        addEvents();
        this.updateTb();
      },
      consume() {
        const { events, emitter } = this;
        if (events) {
          Object.keys(events)
            .forEach(key => {
              emitter.emit(key, ...events[key]);
            });
          this.events = null;
        }
      },
      product(event, ...args) {
        if (!this.events) {
          this.events = {};
        }
        const { events } = this;
        events[event] = args;
      },
      notify(...args) {
        const { events } = this;
        if (!events) {
          this.$nextTick(this.consume.bind(this));
        }
        this.product(...args);
      },
      updateTb(toNative = true) {
        this.notify(event.RTE_ACTIVE_CHANGE, this._getActive(), toNative);
      },
      hasFocus() {
        const { quill } = this;
        return quill && quill.hasFocus();
      },
      isEmpty() {
        const { quill } = this;
        const text = quill.getText();
        if (text.length < 2) {
          const content = quill.getContents();
          if (content.ops.every(({ attributes }) => {
            return !attributes || (Object.keys(attributes).length === 1 && attributes.header);
          })) {
            return true;
          }
        }
        return false;
      },
      setPlaceholderVisible() {
        if (!this.hasFocus() && this.isEmpty()) {
          this.placeholderVisible = true;
        } else {
          this.placeholderVisible = false;
        }
      },
      getHTML() {
        const { quill } = this;
        if (quill) {
          return quill.root.innerHTML;
        }
        return '';
      },
      getMdHTML(delta) {
        const { ops } = delta;
        const text = ops.map((op) => {
          const { insert, attributes } = op;
          if (attributes && attributes.at) {
            return `<a uid="${attributes.at}">${insert}</a>`;
          }
          return insert;
        })
          .join('');
        const html = md.render(text);
        return html;
      },
      getData() {
        const { role } = this;
        const atMap = {};
        const delta = this.quill.getContents().ops;
        const pure = delta.map(op => {
          const { insert, attributes } = op;
          if (attributes && attributes.at && typeof attributes.at === 'string') {
            atMap[attributes.at] = 1;
          }
          return insert;
        })
          .join('');
        const html = role === 'md' ? this.getMdHTML({ ops: delta }) : this.getHTML();
        return {
          delta,
          pure,
          html,
          at: Object.keys(atMap),
          empty: this.isEmpty(),
          focus: this.hasFocus(),
        };
      },
      setDelta(delta) {
        const { quill } = this;
        if (quill) {
          quill.setContents(delta);
        }
      },
      getConfig() {
        return this.config;
      },
      focus() {
        const { quill } = this;
        if (quill) {
          quill.focus();
        }
      },
      clear() {
        const { quill } = this;
        if (quill) {
          quill.setContents([{ insert: '\n' }]);
        }
      },
      atUser(uid, name) {
        const { quill } = this;
        if (quill) {
          const user = { label: name, value: uid };
          quill.at.ui.select(user);
        }
      },
      _getEle(ele) {
        if (!ele) {
          const { link: { editing } } = this.quill;
          if (!editing) {
            return null;
          }
          ele = editing;
        }
        return ele;
      },
      addLink(text, href) {
        const { quill } = this;
        if (quill) {
          if (!quill.hasFocus()) {
            quill.focus();
          }
          const len = text.length;
          const sel = quill.getSelection();
          if (sel.length > 0) {
            quill.deleteText(sel.index, sel.length);
          }
          quill.insertText(sel.index, text, { link: href }, 'api');
          quill.setSelection(sel.index + len, 0);
        }
      },
      updateLink(text, href, ele) {
        ele = this._getEle(ele);
        if (ele) {
          ele.setAttribute('href', href);
          ele.textContent = text;
          const { quill } = this;
          quill.update('api');
          quill.focus();
        }
      },
      removeLink(ele) {
        ele = this._getEle(ele);
        if (ele) {
          const { quill } = this;
          ele.remove();
          quill.update('api');
          quill.focus();
        }
      },
      _getActive() {
        const { root } = this.$refs;
        const result = {};
        if (root) {
          const $toolbar = $(this.$refs.root)
            .find('.ql-toolbar');
          if ($toolbar.length === 1) {
            const $buttons = $toolbar.find('button');
            $buttons.each((i, ele) => {
              const $ele = $(ele);
              const classList = $ele.attr('class')
                .replace(/ql-/g, '')
                .split(' ');
              const [format, value] = classList;
              const more = $ele.val();
              if (format) {
                const keys = [format];
                more && keys.push(more);
                result[keys.join('_')] = !!value;
              }
            });
            const $pickers = $toolbar.find('.ql-picker');
            $pickers.each((i, ele) => {
              const $ele = $(ele);
              const classList = $ele.attr('class')
                .replace(/ql-/g, '')
                .split(' ');
              const [format] = classList;
              const $child = $ele.find('.ql-picker-label');
              let value = $child.attr('data-value');
              if ($ele.hasClass('ql-align') && !value) {
                value = 'left';
              }
              result[format] = value;
            });
          }
        }
        const { quill } = this;
        if (quill) {
          if (quill.hasFocus()) {
            const format = quill.getFormat();
            if (!format.header) {
              result.header = '7';
            }
            if (!format.color) {
              result.color = defaultSelectedColor;
            }
          } else {
            result.header = '7';
            result.color = defaultSelectedColor;
          }
        }
        result.tableDisabled = this.tableDisabled;
        result.linkDisabled = this.linkDisabled;
        return result;
      },
      format(format, ...args) {
        const { quill } = this;
        if (quill) {
          quill.focus();
          switch (format) {
            case 'bold':
              this._format({
                type: 'button',
                selector: '.ql-bold',
              });
              break;
            case 'italic':
              this._format({
                type: 'button',
                selector: '.ql-italic',
              });
              break;
            case 'underline':
              this._format({
                type: 'button',
                selector: '.ql-underline',
              });
              break;
            case 'align':
              this._format({
                type: 'picker',
                className: 'ql-align',
                value: args[0],
              });
              break;
            case 'list_bullet':
              this._format({
                type: 'button',
                selector: '.ql-list[value=bullet]',
              });
              break;
            case 'list_ordered':
              this._format({
                type: 'button',
                selector: '.ql-list[value=ordered]',
              });
              break;
            case 'link':
              if (args[0] === 'start') {
                quill.link.ui.show(args[1], '', '');
              } else {
                this._format({
                  type: 'button',
                  selector: '.ql-link',
                });
              }
              break;
            case 'color':
              this._format({
                type: 'picker',
                className: 'ql-color',
                value: args[0],
              });
              break;
            case 'header':
              this._format({
                type: 'picker',
                className: 'ql-header',
                value: args[0],
              });
              break;
            case 'table':
              this.tableController.create(...args);
              break;
            default:
          }
        }
      },
      _format({
        type, selector, className, value,
      }) {
        const $toolbar = $(this.$refs.root)
          .find('.ql-toolbar');
        if (type === 'button') {
          const $ele = $toolbar.find(selector);
          if ($ele.length) {
            $ele.trigger('click');
          }
        } else if (type === 'picker') {
          this._pick(className, value);
        }
      },
      _pick(className, value) {
        const { quill } = this;
        const { pickers } = quill.theme;
        const picker = pickers.find(item => {
          const { select } = item;
          return select.className === className;
        });
        if (picker) {
          let selected = $(picker.container)
            .find(`.ql-picker-item[data-value='${value}']`);
          if (className === 'ql-align' && value === 'left') {
            selected = $(picker.container)
              .find('.ql-picker-item:first-child');
          }
          if (selected.length) {
            picker.selectItem(selected[0], true);
          }
        }
      },
    },
    mounted() {
      this.init();
      /* setTimeout(() => {
        this.quill.setContents([
          { attributes: { at: 'a' }, insert: 'aaaa' },
          { attributes: { link: 'b' }, insert: 'bbbb' },
          { insert: '456' },
          { attributes: { at: 'b' }, insert: 'b' },
          { attributes: { at: 'b', bold: true }, insert: 'bb' },
          { attributes: { at: 'b' }, insert: 'b' },
          { insert: '789\n' },
        ]);
      }, 200); */
      /* setTimeout(() => {
        this.quill.setContents([{ insert: '1' }, {
          attributes: { link: 'http://baidu.com' },
          insert: 'abc',
        }, { attributes: { header: 7 }, insert: '\n' }]);
      }, 200); */
      //      setTimeout(() => { this.quill.setContents([{ insert: '\n' }, { attributes: { td_start: 'e56e20c2|ad173228|9d5185f1' }, insert: '\n' }, { insert: 'dsds\n' }, { attributes: { td_end: 'e56e20c2|ad173228|9d5185f1' }, insert: '\n' }, { attributes: { td_start: 'e56e20c2|ad173228|5c11f32e' }, insert: '\n' }, { insert: 'dsds\n' }, { attributes: { td_end: 'e56e20c2|ad173228|5c11f32e' }, insert: '\n' }, { attributes: { td_start: 'e56e20c2|8d516430|c42e9df6' }, insert: '\n' }, { insert: '\n' }, { attributes: { td_end: 'e56e20c2|8d516430|c42e9df6' }, insert: '\n' }, { attributes: { td_start: 'e56e20c2|8d516430|2e98c502' }, insert: '\n' }, { insert: '\n' }, { attributes: { td_end: 'e56e20c2|8d516430|2e98c502' }, insert: '\n' }, { insert: '\n' }]); }, 1000);
      //      setTimeout(() => { this.quill.setContents([{ insert: '\n' }, { attributes: { td_start: 'e56e20c2|ad173228|9d5185f1' }, insert: '\n' }, { insert: 'dsds\n' }, { attributes: { td_start: '43a2c80e|6a24ad16|d43ecd43' }, insert: '\n' }, { insert: 'vcv\n' }, { attributes: { td_end: '43a2c80e|6a24ad16|d43ecd43' }, insert: '\n' }, { attributes: { td_start: '43a2c80e|6a24ad16|d23339ce' }, insert: '\n' }, { insert: 'vc\n' }, { attributes: { td_end: '43a2c80e|6a24ad16|d23339ce' }, insert: '\n' }, { attributes: { td_start: '43a2c80e|c3536481|8b72165e' }, insert: '\n' }, { insert: 'cvc\n' }, { attributes: { td_end: '43a2c80e|c3536481|8b72165e' }, insert: '\n' }, { attributes: { td_start: '43a2c80e|c3536481|1ee90ee2' }, insert: '\n' }, { insert: 'dasds\n' }, { attributes: { td_end: '43a2c80e|c3536481|1ee90ee2' }, insert: '\n' }, { attributes: { td_end: 'e56e20c2|ad173228|9d5185f1' }, insert: '\n' }, { attributes: { td_start: 'e56e20c2|ad173228|5c11f32e' }, insert: '\n' }, { insert: 'dsds\n' }, { attributes: { td_end: 'e56e20c2|ad173228|5c11f32e' }, insert: '\n' }, { attributes: { td_start: 'e56e20c2|8d516430|c42e9df6' }, insert: '\n' }, { insert: '\n' }, { attributes: { td_end: 'e56e20c2|8d516430|c42e9df6' }, insert: '\n' }, { attributes: { td_start: 'e56e20c2|8d516430|2e98c502' }, insert: '\n' }, { insert: '\n' }, { attributes: { td_end: 'e56e20c2|8d516430|2e98c502' }, insert: '\n' }, { insert: '\n' }]); }, 1000);
      //      setTimeout(() => { this.quill.setContents([{ insert: '\n' }, { attributes: { td_start: '3f0e174d|f6d9aeb1|8d9efe36' }, insert: '\n' }, { insert: 'dsdsds\n' }, { attributes: { td_start: 'f539597d|146fe5c0|2f62521a' }, insert: '\n' }, { insert: 'sds\n' }, { attributes: { td_end: 'f539597d|146fe5c0|2f62521a' }, insert: '\n' }, { attributes: { td_start: 'f539597d|146fe5c0|c0d2a92d' }, insert: '\n' }, { insert: 'dsds\n' }, { attributes: { td_end: 'f539597d|146fe5c0|c0d2a92d' }, insert: '\n' }, { attributes: { td_start: 'f539597d|cae50ed4|60a12933' }, insert: '\n' }, { insert: 'sdsd\n' }, { attributes: { td_end: 'f539597d|cae50ed4|60a12933' }, insert: '\n' }, { attributes: { td_start: 'f539597d|cae50ed4|6ab17655' }, insert: '\n' }, { insert: 'dsd\n' }, { attributes: { td_end: 'f539597d|cae50ed4|6ab17655' }, insert: '\n' }, { insert: 'dsdsdsd\n' }, { attributes: { td_end: '3f0e174d|f6d9aeb1|8d9efe36' }, insert: '\n' }, { attributes: { td_start: '3f0e174d|f6d9aeb1|2277fdf0' }, insert: '\n' }, { insert: '\n' }, { attributes: { td_end: '3f0e174d|f6d9aeb1|2277fdf0' }, insert: '\n' }, { attributes: { td_start: '3f0e174d|11fea456|a62c410c' }, insert: '\n' }, { insert: '\n' }, { attributes: { td_end: '3f0e174d|11fea456|a62c410c' }, insert: '\n' }, { attributes: { td_start: '3f0e174d|11fea456|3588a666' }, insert: '\n' }, { insert: '\n' }, { attributes: { td_end: '3f0e174d|11fea456|3588a666' }, insert: '\n' }, { insert: '\n' }]); }, 100);
    //      setTimeout(() => { this.quill.setContents([{ insert: '0\n' }, { attributes: { td_start: 'a713e1b1|deaebe89|d3a5ea45|3' }, insert: '\n' }, { insert: '3\n' }, { attributes: { td_end: 'a713e1b1|deaebe89|d3a5ea45|3' }, insert: '\n' }, { attributes: { td_start: 'a713e1b1|deaebe89|c19ad719|3' }, insert: '\n' }, { insert: 'dsds\n' }, { attributes: { td_end: 'a713e1b1|deaebe89|c19ad719|3' }, insert: '\n' }, { attributes: { td_start: 'a713e1b1|deaebe89|dbc16972|3' }, insert: '\n' }, { insert: 'dsdsd\n' }, { attributes: { td_end: 'a713e1b1|deaebe89|dbc16972|3' }, insert: '\n' }, { attributes: { td_start: 'a713e1b1|b396fb80|af4a7f48|3' }, insert: '\n' }, { insert: '\n' }, { attributes: { td_end: 'a713e1b1|b396fb80|af4a7f48|3' }, insert: '\n' }, { attributes: { td_start: 'a713e1b1|b396fb80|3ca212e0|3' }, insert: '\n' }, { insert: '\n' }, { attributes: { td_end: 'a713e1b1|b396fb80|3ca212e0|3' }, insert: '\n' }, { attributes: { td_start: 'a713e1b1|b396fb80|bb44706c|3' }, insert: '\n' }, { insert: '\n' }, { attributes: { td_end: 'a713e1b1|b396fb80|bb44706c|3' }, insert: '\n' }, { attributes: { td_start: 'a713e1b1|64468553|bb7f81e3|3' }, insert: '\n' }, { insert: '\n' }, { attributes: { td_end: 'a713e1b1|64468553|bb7f81e3|3' }, insert: '\n' }, { attributes: { td_start: 'a713e1b1|64468553|93ed98c0|3' }, insert: '\n' }, { insert: '\n' }, { attributes: { td_end: 'a713e1b1|64468553|93ed98c0|3' }, insert: '\n' }, { attributes: { td_start: 'a713e1b1|64468553|8f0a843a|3' }, insert: '\n' }, { insert: '\n' }, { attributes: { td_end: 'a713e1b1|64468553|8f0a843a|3' }, insert: '\n' }, { insert: '\n' }]); }, 500);
    //      setTimeout(() => { this.quill.setContents([{ insert: '\n' }, { attributes: { td_start: 'a713e1b1|deaebe89|d3a5ea45|3' }, insert: '\n' }, { insert: '3\n' }, { attributes: { td_end: 'a713e1b1|deaebe89|d3a5ea45|3' }, insert: '\n' }, { insert: '\n' }]); }, 500);
      //      setTimeout(() => { this.quill.setContents([{ insert: '1111', attributes: { indivisible: '123' } }, { insert: '2222' }, { insert: '1111', attributes: { indivisible: '456' } }, { insert: '2222\n' }]); }, 500);
    },
    beforeDestroy() {
      const { quill } = this;
      if (quill) {
        this.quill = null;
      }
    },
  };
</script>
<style lang="less" module>
  @import (optional,reference) "~../common.less";

  .root {
    height: 100%;
    overflow: auto;
    position: relative;
    background-color: white;

    .placeholder {
      pointer-events: none;
      position: absolute;
      height: auto;
      width: 100%;
      box-sizing: border-box;
      p{
        color: #ccc;
      }
    }

    :global(.ql-container.ql-snow) {
      border: none!important;
    }
    :global(.ql-toolbar) {
      position: absolute;
      top: -10000px;
      left: -10000px;
    }
  }

  :global(.ql-editor) {
    font-family: 'PingFang SC', 'Lantinghei SC', 'Helvetica Neue', 'Helvetica', 'Arial', 'Microsoft YaHei', 'STHeitiSC-Light', 'simsun', 'WenQuanYi Zen Hei', 'WenQuanYi Micro Hei', 'sans-serif' !important;
  }
</style>
