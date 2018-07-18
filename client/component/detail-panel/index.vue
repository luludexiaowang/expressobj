<template>
  <div class="detail-panel">
    <div class="panel-header clearfix">
      <h2 class="title">{{title}}</h2>
      <slot name="edit"></slot>
    </div>
    <div class="panel-content">
      <slot name="content"></slot>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: String
  }
}
</script>

<style lang="stylus" scoped>
@import "~style/common.styl";
.detail-panel {
  padding: 20px 0 10px;
  border: 1px solid #EAEAEA;
  border-radius: 4px;
  background-color: #FFF;
  margin-bottom: 10px;
  .panel-header {
    margin-bottom: 21px;
    line-height: 30px;
    .title {
      position: relative;
      padding-left: 30px;
      font-size: 16px;
      color: $textDarken;
      float: left;
      display: inline-block;
      &:before {
        position: absolute;
        top: 0;
        left: 0;
        content: " ";
        width: 2px;
        height: 30px;
        background-color: $purpleColor;
      }
    }
    .editOrnew{
      font-size: 13px;
      color: $blueColor;
      float: right;
      display: inline-block;
      padding-right: 30px;
      cursor: pointer;
    }
  }
  .panel-content {
    padding: 0 30px;
  }
}
</style>
