<template>
  <div :class="$style.root" v-tap="{methods:click}">
    <slot/>
  </div>
</template>
<script>
  export default{
    mixins: [],
    props: {
    },
    components: {
    },
    data() {
      return {
      };
    },
    computed: {
    },
    methods: {
      click() {
        this.$emit('click');
      },
    },
  };
</script>
<style lang="less" module>
  @import (optional,reference) "~style/common.less";

  @h:unit(26/@basicFontSize,rem);
  .root {
    line-height:@h;
    border-radius: @h/2;
    font-size: unit(14/@basicFontSize,rem);
    color: @darkColor;
  }
</style>
