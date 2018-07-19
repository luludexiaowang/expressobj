<template>
  <div :class="$style.root">
    <div :class="$style.default" :style="{backgroundColor}" v-if="!avatar">
      <span :class="$style.text">{{text}}</span>
    </div>
    <div :class="$style.icon" :style="{backgroundImage:`url(${avatar})`}"/>
  </div>
</template>
<script>
  export default{
    mixins: [],
    props: {
      avatar: {
        type: String,
        default: '',
      },
      name: {
        type: String,
        default: '',
      },
      backgroundColor: {
        type: String,
        default: '',
      },
    },
    components: {
    },
    data() {
      return {
      };
    },
    computed: {
      text() {
        const { name } = this;
        if (name.length > 2) {
          return name.substr(name.length - 2);
        }
        return name;
      },
    },
    methods: {},
  };
</script>
<style lang="less" module>
  @import (optional,reference) "~style/common.less";

  .root {
    width: @bigAvatar;
    height: @bigAvatar;
    border-radius: @bigAvatar/2;
    overflow: hidden;

    .default{
      width: 100%;
      height: 100%;
      border-radius: @bigAvatar/2;
      overflow: hidden;

      .text{
        font-size: @miniFontSize;
        color: white;
        .center;
        word-break: keep-all;
      }
    }
    .icon{
      width: 100%;
      height: 100%;
      background-size: contain;
      background-position: 50% 50%;
      border-radius: @bigAvatar/2;
      overflow: hidden;
    }
  }
</style>
