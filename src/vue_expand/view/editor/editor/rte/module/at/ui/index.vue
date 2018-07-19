<template>
  <div :class="[$style.root,{[$style.open]:open}]" @click="hide">
    <div :class="[$style.content,{[$style.open]:open}]" :style="style" ref="content">
      <div :key="i" :class="[$style.item, {[$style.selected]:i===selectedIndex}]" v-for="(item,i) in data" @click="select(item)">
        {{item.label}}
      </div>
    </div>
  </div>
</template>
<script>
  import $ from 'jquery';
  import './caret/jquery.caret';

  function getOffset(self, selfAlignment, targetPos) {
    return {
      left: targetPos.left - (selfAlignment[0] * self.offsetWidth),
      top: targetPos.top - (selfAlignment[1] * self.offsetHeight),
      width: self.offsetWidth,
      height: self.offsetHeight,
      transformOrigin: `${selfAlignment[0] * 100}% ${selfAlignment[1] * 100}%`,
    };
  }
  function isOverflow(offset, client) {
    const {
      left, top, width, height,
    } = offset;
    const { clientWidth, clientHeight } = client;
    return !(left >= 0 && left + width <= clientWidth && top >= 0 && top + height <= clientHeight);
  }

  export default{
    mixins: [],
    props: {},
    components: {},
    data() {
      return {
        open: false,
        data: [],
        selectedIndex: -1,
        target: null,
        self: null,
        style: {
          left: 0,
          top: 0,
        },
        emitter: null,
        owner: null,
      };
    },
    computed: {},
    methods: {
      hide() {
        this.open = false;
      },
      select(who) {
        const { owner } = this;
        if (owner && typeof owner.select === 'function') {
          owner.select(who);
        }
      },
      calStyle() {
        const { target, self } = this;
        let left = 0;
        let top = 0;
        let transformOrigin = '0 0';
        if (target && self) {
          const targetPos = $(target).caret('offset');
          if (targetPos) {
            const selfAlignments = [
              [0, 0],
              [1, 0],
              [0, 1],
              [1, 1],
            ];
            const offsets = selfAlignments.map(selfAlignment =>
              getOffset(self, selfAlignment, targetPos));
            let finalOffset = null;
            for (let i = 0; i < offsets.length; i += 1) {
              const offset = offsets[i];
              if (!isOverflow(offset, document.documentElement)) {
                finalOffset = offset;
                break;
              }
            }
            if (!finalOffset) {
              [finalOffset] = offsets;
            }
            ({ left } = finalOffset);
            ({ top } = finalOffset);
            ({ transformOrigin } = finalOffset);
          }
        }
        this.style = {
          left: `${left}px`,
          top: `${top}px`,
          transformOrigin,
        };
      },
    },
    watch: {
      target() {
        this.calStyle();
      },
      self() {
        this.calStyle();
      },
      open() {
        this.calStyle();
      },
      data() {
        this.calStyle();
      },
    },
    mounted() {
      this.self = this.$refs.content;
    },
  };
</script>
<style lang="less" module>
  @animateFunc:cubic-bezier(0.23, 1, 0.32, 1);
  .animate(@name:all,@duration:400ms){
    transition:@name @duration @animateFunc;
  }
  @miniShadow:rgba(0, 0, 0, 0.12) 0px 1px 4px;

  .root {
    position: absolute;
    width: 100%;
    height:100%;
    left: 0;
    top:0;
    z-index:1000000;
    visibility: hidden;
    transition: visibility 400ms @animateFunc 0ms;
    &.open {
      visibility: visible;
      transition: visibility 0ms @animateFunc 0ms;
    }

    .content{
      overflow: auto;
      background-color: white;
      border-radius: 4px;
      position: absolute;
      width:150px;
      max-height:300px;
      top:0;
      left:0;
      transform-origin: 0 0;
      transform: scale(0,0);
      .animate(transform);
      box-shadow: @miniShadow;

      &.open{
        transform: scale(1,1);
      }

      .item{
        min-height: 31px;
        box-sizing: border-box;
        width: 100%;
        overflow: hidden;
        line-height: 20px;
        word-break: break-all;
        padding: 5px;
        font-size: 14px;
        cursor: pointer;
        color:#333;
        border-bottom: 1px solid #eee;

        &.selected{
          background-color: #eee;
        }
        &:hover{
          background-color: #eee;
        }
      }
    }
  }
</style>
