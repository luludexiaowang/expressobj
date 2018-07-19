<template>
  <div :class="$style.root">
    <div/>
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
        mouseOver: false,
      };
    },
    computed: {},
    methods: {},
  };
</script>
<style lang="less" module>
  @import (optional,reference) "~../../common.less";

  .root {
    display: inline-block;
    width: 1px;
    height: 24px;
    margin: 0 5px 0 2px;
    vertical-align: middle;

    div{
      width: 1px;
      height: 14px;
      background-color: #ccc;
      margin-top: 4px;
    }
  }
</style>
