<template>
  <div :class="[$style.root, {[$style.open]:open}]" @click="close">
    <div :class="[$style.content, {[$style.open]:open}, contentClass]" ref="self" :style="styles">
      <slot/>
    </div>
  </div>
</template>
<script>
  function getAlignment(alignment) {
    if (typeof alignment !== 'string') {
      return [0, 0];
    }
    if (alignment.split(/\s+/).length !== 2) {
      alignment = '0 0';
    }
    const nMap = {
      left: 0,
      center: 0.5,
      right: 1,
      top: 0,
      middle: 0.5,
      bottom: 1,
    };
    Object.keys(nMap)
      .forEach(key => {
        alignment = alignment.replace(key, nMap[key]);
      });
    const strs = alignment.split(/\s+/);
    const result = [parseFloat(strs[0]), parseFloat(strs[1])];

    return result;
  }
  function getStyles(self, target, alignment) {
    const selfAlignment = getAlignment(alignment.self);
    const targetAlignment = getAlignment(alignment.target);
    const targetOffset = target.getBoundingClientRect();
    return {
      left: (targetOffset.left - (selfAlignment[0] * self.offsetWidth)) +
      (targetAlignment[0] * targetOffset.width) + (typeof alignment.detaLeft === 'number' ? alignment.detaLeft : 0),
      top: (targetOffset.top - (selfAlignment[1] * self.offsetHeight)) +
      (targetAlignment[1] * targetOffset.height) + (typeof alignment.detaTop === 'number' ? alignment.detaTop : 0),
      transformOrigin: `${selfAlignment[0] * 100}% ${selfAlignment[1] * 100}%`,
    };
  }

  export default {
    props: {
      open: Boolean,
      contentClass: String,
      target: {
        type: [Object, HTMLElement],
        default: () => null,
      },
    },
    data() {
      return {
        self: null,
        styles: {},
      };
    },
    watch: {
      open() {
        this.setStyles();
      },
      target() {
        this.setStyles();
      },
      self() {
        this.setStyles();
      },

    },
    mounted() {
      this.self = this.$refs.self;
    },
    methods: {
      setStyles() {
        const {
          open, self, target,
        } = this;
        if (open) {
          if (target == null || self == null) {
            this.styles = {};
            return;
          }
          const aligments = [
            { self: 'left top', target: 'left bottom' },
            { self: 'right top', target: 'right bottom' },
            { self: 'left bottom', target: 'left top' },
            { self: 'right bottom', target: 'right top' },
          ];
          const stylesList = aligments.map(alignment => getStyles(self, target, alignment));
          let styles = stylesList[0];
          const { clientWidth, clientHeight } = document.body;
          const { offsetWidth, offsetHeight } = self;
          stylesList.some(item => {
            const { left, top } = item;
            if (left + offsetWidth > clientWidth ||
              left < 0 ||
              top < 0 ||
              top + offsetHeight > clientHeight) {
              return false;
            }
            styles = item;
            return true;
          });

          Object.keys(styles)
            .forEach(key => {
              if (typeof styles[key] === 'number') {
                styles[key] = `${styles[key]}px`;
              }
            });
          this.styles = styles;
        }
      },
      close() {
        if (this.open) {
          this.$emit('close');
        }
      },
    },
  };

</script>
<style lang="less" module>
  @import (optional,reference) "~../../common.less";

  .root {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 10001;
    visibility: hidden;
    transition: visibility 400ms @animateFunc 0ms;
    &.open {
      visibility: visible;
      transition: visibility 0ms @animateFunc 0ms;
    }

    .content {
      box-sizing: content-box;
      height: auto;
      position: absolute;
      padding: 5px;
      line-height: 0;
      color: #525975;
      word-break: break-all;
      word-wrap: break-word;
      background: #FFFFFF;
      box-shadow: 0 1px 6px 0 rgba(193, 201, 214, 0.55);
      .animate(transform);
      transform: scale(0, 0);
      border-radius: 2px;
      &.open {
        transform: scale(1, 1);
      }
    }
  }
</style>
