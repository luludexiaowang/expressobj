<template>
    <div :class="$style.root" v-tap="{methods:click}">
      <div :class="$style.info">
        <Avatar
          :class="$style.avatar"
          v-bind="data.createdBy"
        />
        <div :class="$style.name" v-html="text"/>
        <div :class="$style.time">
          {{data.formatedCreatedAt}}
        </div>
      </div>
      <div :class="$style.content" v-html="content"></div>
    </div>
</template>
<script>
  import Avatar from './avatar.vue';

  export default{
    mixins: [],
    props: {
      data: {
        type: Object,
        default: () => { return {}; },
      },
    },
    components: {
      Avatar,
    },
    data() {
      return {
      };
    },
    computed: {
      text() {
        const { createdBy: { name }, replyTo } = this.data;
        let result = name;
        if (replyTo) {
          result += `<span>回复</span>${replyTo.name}`;
        }
        return result;
      },
      content() {
        const { content } = this.data;
        return `<p>${content.map(frag => (frag.type === 'USER' ? `<a href="javascript:void(0);">${frag.content.text}</a>` : frag.content.text)).join('')}</p>`;
      },
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

  .root {
    padding: @normalSpace @lessSpace 0 0;
    margin-left: @normalSpace;
    position: relative;
    overflow: hidden;

    &:global(.no-border){
      &::before{
        display: none;
      }
    }

    &::before{
      .half-border;
      border-top: @normalBorder;
    }

    .info{
      position: relative;
      .avatar{
        position: absolute;
        left: 0;
        top: 50%;
        transform: translate(0,-50%);
      }
      .name{
        margin-left: @bigAvatar+@lessSpace;
        color: @lightColor;
        font-size: @lessFontSize;
        line-height: unit(20/@basicFontSize,rem);
        min-height: unit(20/@basicFontSize,rem);
        padding: unit(6/@basicFontSize,rem) 0;
        font-weight: 300;

        span{
          margin: 0 @miniSpace;
        }
      }
      .time{
        position: absolute;
        right: 0;
        top: 50%;
        transform: translate(0,-50%);
        color: @lightColor;
        font-size: @miniFontSize;
        font-weight: 300;
      }
    }

    .content{
      padding: 0;
      margin: @lessSpace 0;
      margin-left: @bigAvatar+@lessSpace;
      font-size: unit(15/@basicFontSize,rem);
      color: @darkColor;
      line-height: unit(21/@basicFontSize,rem);
    }
  }
</style>
