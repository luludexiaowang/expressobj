<template>
    <div
      :class="[$style.root, {[$style.mouseOver]:mouseOver}, {[$style.active]:active}]"
      @mouseover="!disabled&&changeMouseState(true)"
      @mouseout="changeMouseState(false)"
      @click="!disabled&&$emit('click')"
      >
      <slot/>
      <div :class="$style.mask" v-show="disabled"/>
    </div>
</template>
<script>
  import Basic from '../basic';

  export default{
    mixins: [],
    props: {
      active: {
        default: false,
        type: Boolean,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    components: {
      Basic,
    },
    data() {
      return {
        mouseOver: false,
      };
    },
    computed: {},
    methods: {
      changeMouseState(value) {
        this.mouseOver = value;
      },
    },
  };
</script>
<style lang="less" module>
  @import (optional,reference) "~../../common.less";

  .root {
    display: inline-block;
    border: 1px solid transparent;
    height: 24px;
    cursor: pointer;
    font-size: 0;
    border-radius: 2px;
    vertical-align: middle;
    box-sizing: border-box;
    position: relative;

    &:not(:last-child){
      margin-right: 3px;
    }
    /*margin-top: -13px;*/
    /*margin-right: 3px;*/

    & *{
      cursor: pointer;
    }
    &.active{
      border: 1px solid #E6E7EB;
    }
    &.mouse-over{
      border: 1px solid #E6E7EB;
    }
    img{
      height:100%;
      display: inline-block;
      pointer-events: none;
      vertical-align: middle;
    }

    .mask{
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      background-color: rgba(255, 255, 255, .5);
    }
  }
</style>
