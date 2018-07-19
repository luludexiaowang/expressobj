<template>
  <div :class="[$style.root, {'kr-editor-full':full}]">
    <Toolbar
      ref="toolbar"
      :emitter="emitter"
      :tableDisabledMask="tableDisabledMask"
      :full="full"
      :mode="mode"
      @mode-change="modeChange"
      @full-change="fullChange"
      v-show="!inApp&&toolbar"
    />
    <div :class="$style.content" :style="{
        top: toolbarHeight,
        bottom: footerHeight,
      }">
      <RTE
        ref="rte"
        :emitter="emitter"
        role="rte"
        :placeholder="placeholder"
        :atConfig="atConfig"
        @text-change="textChange"
        v-show="mode==='rte'&&rte"
      />
      <MD
        ref="md"
        :emitter="emitter"
        :placeholder="placeholder"
        :atConfig="atConfig"
        :defaultMdSplit="defaultMdSplit"
        @text-change="textChange"
        v-show="mode==='md'&&md"
      />
    </div>
    <div :class="$style.bottom" ref="bottom">
      <slot/>
    </div>
  </div>
</template>
<script>
  import EventEmitter from 'wolfy87-eventemitter';
  import RTE from './rte';
  import MD from './md';
  import Toolbar from './toolbar';
  import Bridge from '../../../../wrapper/native';
  import event from './config/event';

  const bridge = Bridge.getInstance();

  /* eslint-disable no-case-declarations */
  export default{
    mixins: [],
    props: {
      toolbar: {
        type: Boolean,
        default: true,
      },
      tableDisabledMask: {
        type: Boolean,
        default: false,
      },
      rte: {
        type: Boolean,
        default: true,
      },
      md: {
        type: Boolean,
        default: true,
      },
      defaultMdSplit: {
        type: Boolean,
        default: true,
      },
      defaultMode: {
        type: String,
        default: 'rte',
      },
      atConfig: {
        type: Object,
        default: () => { return {}; },
      },
      placeholder: {
        type: String,
        default: '',
      },
    },
    components: {
      RTE,
      Toolbar,
      MD,
    },
    data() {
      return {
        emitter: new EventEmitter(),
        full: false,
        mode: this.$props.defaultMode,
        toolbarHeight: '0px',
        footerHeight: '0px',
        inApp: window.inApp,
      };
    },
    created() {
      const { emitter } = this;

      // 处理ready
      const ready = {};
      const MIN = 2;
      const setReady = (k, v) => {
        ready[k] = v;
        if (Object.keys(ready).length === MIN) {
          bridge.route('onReady');
          this.$emit('ready');
        }
      };
      emitter.on(event.RTE_READY, () => { setReady('rte', true); });
      emitter.on(event.MD_READY, () => { setReady('md', true); });

      // 处理focus
      const focus = {
        rte: false,
        tb: false,
      };
      const setFocus = (k, v) => {
        focus[k] = v;
        if (Object.keys(focus).some(key => !!focus[key])) {
          emitter.emit(event.EDT_FOCUS);
          this.$emit('editor-focus');
        } else {
          emitter.emit(event.EDT_BLUR);
          this.$emit('editor-blur');
        }
      };
      emitter.on(event.TB_FOCUS, () => { setFocus('tb', true); });
      emitter.on(event.TB_BLUR, () => { setFocus('tb', false); });
      emitter.on(event.RTE_FOCUS, () => { setFocus('rte', true); });
      emitter.on(event.RTE_BLUR, () => { setFocus('rte', false); });
    },
    mounted() {
      this.poll();
    },
    beforeDestroy() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    },
    methods: {
      poll() {
        const { toolbar, bottom } = this.$refs;
        let toolbarHeight = '0px';
        let footerHeight = '0px';
        if (toolbar.$el) {
          toolbarHeight = `${toolbar.$el.offsetHeight}px`;
        }
        if (bottom) {
          footerHeight = `${bottom.offsetHeight}px`;
        }
        this.toolbarHeight = toolbarHeight;
        this.footerHeight = footerHeight;
        this.timer = setTimeout(this.poll.bind(this), 200);
      },
      textChange() {
        this.$emit('text-change', this.invoke('getData'));
      },
      modeChange(nv) {
        this.mode = nv;
        this.$emit('mode-change', nv);
        this.textChange();
      },
      fullChange(nv) {
        this.full = nv;
      },
      invoke(method, ...data) {
        if (method === 'changeMode') {
          [this.mode] = data;
          return undefined;
        }
        const { $refs, mode } = this;
        let target = null;
        switch (mode) {
          case 'rte':
            target = $refs[mode];
            break;
          case 'md':
            const md = $refs[mode];
            if (md.$refs) {
              target = md.$refs.rte;
            }
            break;
          default:
        }
        if (target && typeof target[method] === 'function') {
          const result = target[method](...data);
          if (method === 'getData') {
            Object.assign(result, { type: mode.toUpperCase() });
          }
          return result;
        }
        return undefined;
      },
    },
  };
</script>
<style lang="less" module>
  @import (optional,reference) "~./common.less";

  .root {
    position: relative;
    background-color: white;

    &:global(.kr-editor-full){
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      z-index: 10000;
    }
  }
  .content{
    position: absolute;
    left: 0;
    width: 100%;
    overflow:hidden;
  }

  .bottom{
    position: absolute;
    left: 0;
    width: 100%;
    bottom: 0;
  }
</style>
