<template>
  <el-menu
    :class="$style.root"
    ref="menu"
    mode="horizontal"
    menu-trigger="click"
    :default-active="active"
    unique-opened
    class="nav-meun-box"
    >
    <el-menu-item class="list-item nav-main-item" :class="$style.active" index="1">
        首页
    </el-menu-item>
    <el-menu-item class="list-item nav-main-item" index="2">
        内容
    </el-menu-item>
  </el-menu>

</template>
<script>

export default{
  mixins: [],
  props: {
  },
  components: {
  },
  data () {
    return {
      fixedEntries: [
        {
          text: '首页',
          path: '/home/index'
        },
        {
          text: '文件库',
          path: '/home/file'
        }
      ],
      active: '',
      special: null,
      menuWidth: [], // 导航栏宽度
      threshold: 1000,
      entries: [] // 路径数组
    }
  },
  computed: {
  },
  methods: {

  },
  watch: {
  }
}
</script>
<style lang="stylus" module>
  @import "~style/common.styl";
  .childMenuItem:hover{
    color: $buttonColor
  }
  .sel{
    $sw = 12px
    content: ''!important
    width: $sw!important
    height: 1px!important
    position: absolute!important
    left: 50%!important
    bottom: 12px!important
    margin-left: -($sw/2)!important
    background-color: white!important
  }
  .root {
    :global(.el-submenu) {
      :global(.el-submenu__title) {
        color: #AEB7C0!important
        font-weight: 300!important
        border: none!important
        &:hover {
          color: white!important
          background-color: transparent !important
          &::after {
            display: block
          }
        }
        &:after {
          display: none
          content: '' !important
          width: 12px !important
          height: 1px!important
          position: absolute!important
          left: 50%!important
          bottom: 12px!important
          margin-left: -6px !important
          background-color: white!important
        }
      }
      :global(.el-menu-item) {
        &:hover {
          color: white!important
          background-color: #694EC4!important
          &:after{
            display: none!important
          }
        }
        &:global(.is-active) {
          color: #694EC4!important
          &:after {
            display: none!important
          }
          &:hover{
            color: white!important
          }
        }
      }
    }
    :global(.el-menu-item) {
      color: #AEB7C0!important
      font-weight: 300!important
      border: none!important
      position: relative!important

      &.active{
        color: white!important
        background-color: transparent!important
        &:after{
          @extend .sel
        }
      }
      &:hover{
        color: white!important
        background-color: transparent!important

        &:after{
          @extend .sel
        }
      }
      &:focus{
        background-color: transparent!important
      }
      &:global(.is-active){
        color: white!important
        background-color: transparent!important
        &:after{
          @extend .sel
        }
      }
    }
    :global(.el-submenu__icon-arrow){
      display: none
    }
  }

</style>
