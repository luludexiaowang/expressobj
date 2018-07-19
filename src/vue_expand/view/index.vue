<template>
    <router-view></router-view>
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
<style lang="less">
  @import (optional,reference) "~style/common.less";
  @import '~normalize.css';
  html{
    font-size: unit(@basicFontSize,px);
  }
  html,body{
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>
