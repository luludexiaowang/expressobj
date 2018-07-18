<template>
  <div :class="$style.root">
    <router-view/>
  </div>
</template>

<script>
// import Header from ''
export default {
  components: {

  }
}
</script>
<style lang="stylus" module>
  @import "~style/common.styl";
  .root{
    width: 100%
    height: 100%
  }
</style>



