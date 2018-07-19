<template>
    <div :class="$style.root">
      <Editor
        ref="editor"
        :toolbar="toolbar"
        :defaultMdSplit="defaultMdSplit"
        :defaultMode="defaultMode"
        :placeholder="placeholder"
        :atConfig="atConfig"
        :class="$style.editor"
      />
    </div>
</template>
<script>
  import Bridge from '../../../wrapper/native';
  import Editor from './editor';

  const bridge = Bridge.getInstance();

  const GLOBAL_ENTRY_NAME = 'NATIVE_ENTRY';

  /* eslint-disable max-len */
  export default{
    mixins: [],
    props: {},
    components: {
      Editor,
    },
    data() {
      return {
        toolbar: true,
        placeholder: window.config.placeholder || '',
        defaultMode: window.config.defaultMode || 'rte',
        defaultMdSplit: window.config.defaultMdSplit ?
          window.config.defaultMdSplit === 'true' : true,
        atConfig: window.inApp ? {
          onStart() {
            bridge.route('onAtStart');
          },
          onStop() {
          },
          onFetch() {
          },
        } : {
          onFetch(query, onSetData) {
            setTimeout(() => {
              const result = [];
              for (let i = 0; i < 5; i += 1) {
                result.push({ label: query, value: query });
              }
              onSetData(result);
            }, 100);
          },
          onStart() {
          },
          onStop() {
          },
        },
      };
    },
    computed: {},
    methods: {},
    created() {
      window[GLOBAL_ENTRY_NAME] = (...args) => {
        const { editor } = this.$refs;
        if (editor) {
          return editor.invoke(...args);
        }
        return undefined;
      };
    },
    beforeDestroy() {
      window[GLOBAL_ENTRY_NAME] = null;
    },
  };
</script>
<style lang="less" module>
  @import (optional,reference) "~style/common.less";

  .root {
    height: 100%;
    .editor{
      height: 100%;
      /*height: 400px;*/
    }
  }
</style>
