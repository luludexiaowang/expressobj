<template>
  <div :class="$style.root">
    <pre :class="$style.delta" :spellcheck="false" v-html="JSON.stringify(content.nowDelta)"/>
    <pre :class="[$style.delta, $style.second]" :spellcheck="false" v-html="JSON.stringify(content.changeDelta)"/>
  </div>
</template>
<script>
  export default{
    mixins: [],
    props: {},
    components: {},
    data() {
      return {
        content: {
          nowDelta: {},
          changeDelta: {},
        },
      };
    },
  };
</script>
<style lang="less" module>

  .root {
    padding: 8px;
    border-top: 1px solid #E6E7EB;
    border-bottom: 1px solid #E6E7EB;
    position: fixed;
    bottom: 0;
    width: 100%;
    left: 0;
    height: 200px;
    box-sizing: border-box;
    overflow: auto;

    .delta{
      margin: 0;
      font-size: 14px;
      padding: 5px 10px;
      border-radius: 3px;
      background-color: #f0f0f0;
      white-space: pre-wrap;
      box-sizing: border-box;
      line-height: 1.42;
      tab-size: 4;
      word-wrap: break-word;

      &.second{
        margin-top: 10px;
      }
    }
  }
</style>
