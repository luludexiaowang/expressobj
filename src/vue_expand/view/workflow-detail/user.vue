<template>
    <div :class="$style.root">
      <Avatar
        :class="$style.avatar"
        v-bind="user"
      />
      <div
        :class="$style.content">
        <div :class="$style.title">{{user.name}}</div>
        <div :class="$style.detail">{{time}}</div>
      </div>
      <Btn
        :class="$style.btn"
        @click="$emit('edit')"
        v-if="currentUid===user.uid"
      >编辑</Btn>
    </div>
</template>
<script>
  import Avatar from './avatar.vue';
  import Btn from './btn.vue';

  export default{
    mixins: [],
    props: {
      user: {
        type: Object,
        default: () => { return {}; },
      },
      currentUid: String,
      time: String,
    },
    components: {
      Avatar,
      Btn,
    },
    data() {
      return {
      };
    },
    computed: {},
    methods: {
    },
  };
</script>
<style lang="less" module>
  @import (optional,reference) "~style/common.less";

  .root {
    width: 100%;
    box-sizing: border-box;
    position: relative;

    .avatar{
      position: absolute;
      left: 0;
      top: 50%;
      transform: translate(0,-50%);
    }
    .content{
      margin-left: @bigAvatar+@lessSpace;
      margin-right: unit(60/@basicFontSize,rem);
      min-height: unit(37/@basicFontSize,rem);;

      .title{
        font-size: @lessFontSize;
        color: @darkColor;
        line-height: unit(20/@basicFontSize,rem);
      }
      .detail{
        font-size: @miniFontSize;
        color: @lightColor;
        line-height: unit(17/@basicFontSize,rem);
        font-weight: 300;
      }
    }
    .btn{
      position: absolute;
      right: 0;
      top: 50%;
      transform: translate(0,-50%);
    }
  }
</style>
