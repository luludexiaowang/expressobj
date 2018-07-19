<template>
  <div :class="$style.root" ref="root" tabindex="1" @focus="focus" @blur="blur">
    <Picker type="list" :data="[
        {label:'富文本', value:'rte'},
        {label:'Markdown', value:'md'},
      ]" :value="mode" @change="modeChange"
    />
    <Btn
      :active="active.bold"
      @click="format('bold')"
      v-show="mode==='rte'"
    >
      <img src="./asset/font-bold.svg"/>
    </Btn>
    <Btn
      :active="active.italic"
      @click="format('italic')"
      v-show="mode==='rte'"
    >
      <img src="./asset/font-italic.svg"/>
    </Btn>
    <Btn
      :active="active.underline"
      @click="format('underline')"
      v-show="mode==='rte'"
    >
      <img src="./asset/font-underline.svg"/>
    </Btn>
    <Picker type="color" :data="config.color" :value="active.color" @change="colorChange" @click="focusTransfer"
            v-show="mode==='rte'" @focus="focus" @blur="blur"/>
    <Split v-show="mode==='rte'"/>
    <Picker type="list" :data="config.header" :value="active.header" @change="headerChange"
            v-show="mode==='rte'" @focus="focus" @blur="blur"  @click="focusTransfer" extra="header"/>
    <Btn
      :active="active.list_bullet"
      @click="format('list_bullet')"
      v-show="mode==='rte'"
    >
      <img src="./asset/list-bullet.svg"/>
    </Btn>
    <Btn
      :active="active.list_ordered"
      @click="format('list_ordered')"
      v-show="mode==='rte'"
    >
      <img src="./asset/list-ordered.svg"/>
    </Btn>
    <Picker
      type="align"
      :data="[
          {value:'left', label: 'left'},
          {value:'right', label: 'right'},
          {value:'center', label: 'center'},
          {value:'justify', label: 'justify'},
        ]"
      :value="active.align"
      @change="alignChange"
      v-show="mode==='rte'"
      @focus="focus" @blur="blur"
      @click="focusTransfer"
    />
    <Split
      v-show="mode==='rte'"
    />
    <Btn
      ref="link"
      :disabled="active.linkDisabled"
      v-show="mode==='rte'"
      @click="addLink"
    >
      <img src="./asset/link.svg"/>
    </Btn>
    <Picker
      type="table"
      :disabled="active.tableDisabled"
      :data="config.table"
      @change="tableChange"
      v-show="mode==='rte'&&!tableDisabledMask"
      @click="focusTransfer"
    />
    <Btn
      :class="$style.right"
      @click="toggleFull"
    >
      <img src="./asset/full-screen.svg" v-show="!full"/>
      <img src="./asset/full-screen-reverse.svg" v-show="full"/>
    </Btn>
  </div>
</template>
<script>
  import EventEmitter from 'wolfy87-eventemitter';
  import Btn from './btn';
  import Split from './split';
  import Picker from './picker';
  import config from '../config';
  import Bridge from '../../../../../wrapper/native';
  import event from '../config/event';

  const bridge = Bridge.getInstance();
  const { header, table } = config;
  const color = config.color.map(item => { return { value: item }; });

  export default{
    mixins: [],
    props: {
      emitter: {
        type: EventEmitter,
        default: () => new EventEmitter(),
      },
      mode: {
        type: String,
        default: 'rte',
      },
      full: {
        type: Boolean,
        default: false,
      },
      tableDisabledMask: {
        type: Boolean,
        default: false,
      },
    },
    components: {
      Split,
      Btn,
      Picker,
    },
    data() {
      return {
        config: {
          table,
          color,
          header,
        },
        active: {},
      };
    },
    computed: {},
    methods: {
      modeChange(nv) {
        this.$emit('mode-change', nv);
      },
      toggleFull() {
        this.$emit('full-change', !this.full);
      },
      colorChange(nv) {
        this.format('color', nv);
      },
      headerChange(nv) {
        this.format('header', nv);
      },
      tableChange(nv) {
        this.format('table', nv);
      },
      alignChange(nv) {
        this.format('align', nv);
      },
      addLink() {
        const { emitter } = this;
        emitter.emit(event.LINK_ADD, this.$refs.link.$el);
      },
      focus() {
        const { emitter } = this;
        emitter.emit(event.TB_FOCUS);
      },
      blur() {
        const { emitter } = this;
        setTimeout(() => {
          emitter.emit(event.TB_BLUR);
        }, 0);
      },
      format(...args) {
        const { emitter } = this;
        emitter.emit(event.TB_FORMAT, ...args);
      //        toolbarEmitter.emit('rte:sync');
      },
      focusTransfer() {
        const { emitter } = this;
        emitter.emit(event.TB_FOCUS_TRANSFER);
      },
    },
    created() {
      const { emitter } = this;

      // active改变
      emitter.on(event.RTE_ACTIVE_CHANGE, (nv, toNative) => {
        this.active = nv;
        if (toNative) {
          bridge.setData('active', nv);
        }
      });
    },
  };
</script>
<style lang="less" module>
  @import (optional,reference) "~../common.less";

  .root {
    background-color: #F9FAFD;
    /*line-height: 30px;*/
    line-height: 0;
    padding: 5px 15px;
    outline: none;
    border-bottom: 1px solid #E6E7EB;

    .right{
      float:right;
    }
    .root *{
      box-sizing: content-box;
    }
  }
</style>
