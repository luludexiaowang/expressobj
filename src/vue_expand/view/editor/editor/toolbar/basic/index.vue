<template>
  <div
    :class="$style.root"
    @mouseover="$emit('mouseover')"
    @mouseout="$emit('mouseout')"
    @click="$emit('click')"
  >
    <slot/>
  </div>
</template>
<script>
  export default{
    mixins: [],
    props: {},
    components: {
    },
    data() {
      return {};
    },
    computed: {},
    methods: {},
  };
</script>
<style lang="less" module>
  @import (optional,reference) "~../../common.less";

  .root {
    /*margin-top: -13px;*/
    /*margin-top: 2px;*/
    /*margin-bottom: 2px;*/
    display: inline-block;
    height: 24px;
    line-height: 24px;
    vertical-align: middle;
    border: 1px solid transparent;
    box-sizing: content-box;
    display: none;
  }
</style>
