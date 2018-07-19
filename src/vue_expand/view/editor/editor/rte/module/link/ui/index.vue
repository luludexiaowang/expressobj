<template>
  <Popup
    :class="$style.root"
    :open="open"
    :target="target"
    @close="close"
    :contentClass="$style.content"
  >
    <div @click.stop="">
      <div :class="$style.line">
        <label>文本</label>
        <input :value="text" @input="input('text',...arguments)"/>
      </div>
      <div :class="$style.line">
        <label>url</label>
        <input :value="href" @input="input('href',...arguments)"/>
      </div>
      <div :class="[$style.line, $style.btns]">
        <span @click="save">保存</span>
        <span @click="remove" v-show="ele">删除</span>
        <span @click="close">取消</span>
        <div :class="$style.tip">{{tip}}</div>
      </div>
    </div>
  </Popup>
</template>
<script>
  import Popup from '../../../../toolbar/popup';

  export default{
    mixins: [],
    props: {},
    components: {
      Popup,
    },
    data() {
      return {
        open: false,
        target: null,
        text: '',
        href: '',
        tip: '',
        ele: null,
        saveCb: null,
        removeCb: null,
      };
    },
    computed: {},
    methods: {
      close() {
        this.open = false;
      },
      input(key, e) {
        this[key] = e.target.value;
      },
      remove() {
        const {
          ele, removeCb,
        } = this;
        if (typeof removeCb === 'function') {
          removeCb(ele);
          this.close();
        }
      },
      save() {
        const {
          text, href, ele, saveCb,
        } = this;
        if (/^\s*$/.test(text)) {
          this.tip = '文本不能为空';
          return;
        }
        if (/^\s*$/.test(href)) {
          this.tip = 'url不能为空';
          return;
        }
        if (!/^https?:\/\/.+/.test(href)) {
          this.tip = 'url格式不正确';
          return;
        }
        this.tip = '';
        if (typeof saveCb === 'function') {
          saveCb(text, href, ele);
          this.close();
        }
      },
    },
  };
</script>
<style lang="less" module>
  .root{
    .content{
      width: 200px;

      .line{
        height: 30px;
        line-height: 30px;
        font-size: 13px;
        position: relative;

        &.btns{
          text-align: right;
          margin-top: 5px;
        }

        label{
          width: 40px;
          display: inline-block;
        }
        input{
          width: 160px;
          box-sizing: border-box;
          border: 1px solid #E6E7EB;
          height: 26px;
          outline: none;
        }
        span{
          cursor: pointer;
          padding: 6px;
          color: #5c8cee;
          border-radius: 3px;

          &:hover{
            background-color: #E6E7EB;
          }
        }
        .tip{
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          color: red;
        }
      }
    }
  }
</style>
