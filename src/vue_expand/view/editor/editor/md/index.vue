<template>
    <div :class="[$style.root]">
      <RTE
        ref="rte"
        v-bind="$props"
        role="md"
        :class="[{[$style.split]:split},$style.rte]"
        @text-change="textChange"
      />
      <div :class="$style.view" v-show="split">
        <div class="ql-editor-result" v-html="html"/>
      </div>
    </div>
</template>
<script>
  import RTE from '../rte';

  export default{
    mixins: [],
    props: {
      ...RTE.props,
      defaultMdSplit: {
        type: Boolean,
        default: true,
      },
    },
    components: {
      RTE,
    },
    data() {
      return {
        split: this.defaultMdSplit,
        html: '',
      };
    },
    computed: {
    },
    methods: {
      textChange(delta) {
        const { rte } = this.$refs;
        let html = '';
        if (rte) {
          html = rte.getMdHTML(delta);
        }
        this.html = html;
        this.$emit('text-change');
      },
    },
  };
</script>
<style lang="less" module>
  @import (optional,reference) "~../common.less";

  .root {
    position: relative;
    width: 100%;
    height: 100%;

    .rte{
      /*background-color: #333;*/
    }
    .split{
      width: 50%;
    }
    .view{
      width:50%;
      position: absolute;
      top: 0;
      right: 0;
      height: 100%;
      background-color: white;
      border-left: 5px solid #eee;
      box-sizing: border-box;
    }
  }
</style>
