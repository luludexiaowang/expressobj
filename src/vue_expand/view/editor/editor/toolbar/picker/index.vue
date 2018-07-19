<template>
  <div :class="$style.root">
    <Btn :class="[$style.btn, {
    [$style.rootColor]:type==='color',
    [$style.rootTable]:type==='table',
    [$style.rootList]:type==='list',
    [$style.rootAlign]:type==='align',
  }]" @click="click" ref="root" :disabled="disabled">
      <div :class="$style.content" v-if="type==='align'">
        <img :src="imgs[selected.label]" v-if="selected"/>
      </div>
      <div :class="$style.content" v-if="type==='list'">
        {{selected?selected.label:placeholder}}
      </div>
      <div :class="$style.content" v-if="type==='color'">
        <img src="../asset/font-color.svg"/>
        <div
          :class="$style.bottom"
          :style="{
            backgroundColor:selected&&selected.value,
          }"
        />
      </div>
      <div :class="$style.content" v-if="type==='table'">
        <img src="../asset/form.svg"/>
      </div>
      <img :class="[$style.expand, {[$style.up]:open}]" src="../asset/expand.svg" v-if="type!=='table'"/>
    </Btn>
    <Popup
      :open="open"
      :target="target"
      @close="close"
      :contentClass="$style[type]"
    >
      <template v-if="type==='align'">
        <div
          :key="i"
          :class="[$style.option]"
          v-for="(option,i) in data" @click="select(option)"
        >
          <img :src="imgs[option.label]"/>
        </div>
      </template>
      <template v-if="type==='color'">
        <div
          :key="i"
          :class="[$style.option]"
          :style="{
            backgroundColor:option.value,
          }"
          v-for="(option,i) in data" @click="select(option)"
        />
      </template>
      <template v-if="type==='table'">
        <div
          :key="i"
          :class="$style.row"
          v-for="(row,i) in data"
        >
          <div
            :key="j"
            :class="[$style.option, {[$style.hover]:i<=over[0]&&j<=over[1]}]"
            @mouseover="mouseover(i,j)"
            @mouseout="mouseover(-1,-1)"
            v-for="(option,j) in row" @click="select(option)"
          />
        </div>
      </template>
      <template v-if="type==='list'">
        <div
          :key="i"
          :class="[$style.option, extra==='header'?$style[`header${option.value}`]:'']"
          v-for="(option,i) in data" @click="select(option)"
        >
          {{option.label}}
        </div>
      </template>
    </Popup>
  </div>
</template>
<script>
  import Btn from '../btn';
  import Popup from '../popup';

  export default{
    mixins: [],
    props: {
      type: {
        type: String,
        default: 'list',
      },
      extra: {
        type: String,
        default: '',
      },
      data: {
        type: Array,
        default: () => [],
      },
      value: [Number, String, Object],
      placeholder: String,
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    components: {
      Btn,
      Popup,
    },
    data() {
      return {
        open: false,
        target: null,
        over: [-1, -1],
        imgs: {
          left: require('../asset/align-left.svg'),
          right: require('../asset/align-right.svg'),
          center: require('../asset/align-center.svg'),
          justify: require('../asset/align-justify.svg'),
        },
      };
    },
    computed: {
      selected() {
        const { value, data } = this;
        return data.find(item => item.value === value);
      },
    },
    methods: {
      click() {
        this.open = !this.open;
        this.$emit('click');
      },
      close() {
        this.open = false;
      },
      select(item) {
        const { value } = this;
        if (item !== value) {
          this.$emit('change', item.value, item);
        }
      },
      mouseover(i, j) {
        this.over = [i, j];
      },
    },
    mounted() {
      this.target = this.$refs.root.$el;
    },
  };
</script>
<style lang="less" module>
  @import (optional,reference) "~../../common.less";

  .root{
    display: inline-block;

    .btn {
      padding: 0 5px;
      position: relative;

      &.root-align{
        .content{
          width: 30px;

          img{
            display: block;
            width: 22px;
          }
        }
      }
      &.root-table{
        padding: 0;
        .content{
          margin-right:0;
        }
      }
      &.root-list{
        .content{
          width: 60px;
          font-size: 12px;
        }
      }

      .expand{
        height:7px;
        display: block;
        position: absolute;
        right: 5px;
        top: 50%;
        margin-top:-3.5px;
        .animate(transform);

        &.up{
          transform: rotate(180deg);
        }
      }
      .content{
        width: 24px;
        height: 100%;
        line-height: 22px;
        margin-right: 10px;
        /*display: inline-block;*/
        /*vertical-align: middle;*/
        /*position: relative;*/
        text-overflow: ellipsis;
        overflow: hidden;
        color: #626E7C;
        position: relative;

        &>img{
          display: block;
          width: 100%;
          height: 100%;
        }
        .bottom{
          position: absolute;
          left: 20%;
          bottom: 3px;
          width: 60%;
          height: 3px;
        }
      }
    }
  }

  .align{
    .option{
      width: 20px;
      height: 20px;
      cursor: pointer;
      border: 1px solid transparent;
      line-height: 20px;

      &:hover{
        border: 1px solid #E6E7EB;
      }

      img{
        display: block;
        width: 100%;
      }
    }
  }
  .list{
    padding: 0!important;
    .option{
      color:#626E7C;
      width: 90px;
      line-height: 1.5;
      word-break: break-all;
      padding: 5px;
      font-size: 12px;
      cursor: pointer;
      border-bottom: 1px solid #E6E7EB;

      &:hover{
        background-color: #E6E7EB;
      }

      .header{
        font-weight: bold;
        line-height: 1.5;
      }
      &.header1{
        font-size: 22px;
        .header;
      }
      &.header2{
        font-size: 20px;
        .header;
      }
      &.header3{
        font-size: 18px;
        .header;
      }
      &.header7{
        font-size: 13px;
        line-height: 1.5;
        color: #525975;
      }
      &.header8{
        font-size: 12px;
        line-height: 1.5;
        color: #9094a3;
      }
    }
  }
  .color{
    width: 160px;
    .option{
      display: inline-block;
      width: 22px;
      height: 22px;
      vertical-align: middle;
      box-sizing: border-box;
      margin: 2px;
      cursor: pointer;
    }
  }
  .table{
    .row{
      line-height: 22px;
      overflow: hidden;

      .option{
        display: inline-block;
        width: 22px;
        height: 22px;
        vertical-align: middle;
        box-sizing: border-box;
        border: 1px solid #ccc;
        margin: 2px;
        cursor: pointer;

        &:hover{
          background-color: #E6E7EB;
        }

        &.hover{
          background-color: #E6E7EB;
        }

      }
    }
  }
</style>
