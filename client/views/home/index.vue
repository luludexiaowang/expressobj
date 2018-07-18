<template>
  <div :class="$style.root">
    <div
      :class="$style.nav"
    >
      <img
        :class="$style.logo"
        src="~assets/images/logo.png"
      />
      <top-nav
        :class="$style.menu"
      />
      <div :class="$style.extra"></div>
    </div>
    <div :class="$style.content">
      <detail-panel title="最新进展">
        <!-- <div slot="content">
          <div class="clearfix new-progress-nav">
            <span class="new-progress-list" @click="toggleProgressCurrent('WorkProgress')">
              工作进展
              <span class="is-change" v-if="progressCurrent==='WorkProgress'"></span>
            </span>
            <span class="new-progress-list" @click="toggleProgressCurrent('Observation') && (companyTrendHasNewMsg=false)">
              观察仓
              <span class="is-change" v-if="progressCurrent==='Observation'"></span>
              <div class="red-dot" v-if="companyTrendHasNewMsg&&progressCurrent!=='Observation'"></div>
            </span>
            <span class="new-progress-list" @click="toggleProgressCurrent('Opportunity') && (opportunityHasNewMsg=false)">
              机会
              <span class="is-change" v-if="progressCurrent==='Opportunity'"></span>
              <div class="red-dot" v-if="opportunityHasNewMsg&&progressCurrent!=='Opportunity'"></div>
            </span>
          </div>
          <component :is="progressCurrent" ref="current"></component>
        </div> -->
      </detail-panel>
      <!-- <transition name="show">
        <router-view></router-view>
      </transition> -->
    </div>
  </div>
</template>
<script>
import TopNav from 'client/component/top-nav'
import DetailPanel from 'client/component/detail-panel'
// import WorkProgress from 'client/component/work-progress/WorkProgress'

export default {
  mixins: [],
  props: {},
  components: {
    TopNav,
    DetailPanel
    // WorkProgress
  },
  data () {
    return {
      progressCurrent: 'WorkProgress',
      companyTrendHasNewMsg: false,
      opportunityHasNewMsg: false
    }
  },
  computed: {
  },
  created () {
  },
  methods: {
    toggleProgressCurrent (current) {
      this.progressCurrent = current
      return true
    }
  },
  mounted () {

  }
}
</script>
<style lang="stylus" module>
  @import "~style/common.styl";
  .root {
    .nav{
      height: $navHeight;
      position: relative;
      line-height: 0;
      $lh= 36px;
      background-color: $mainColorTone;
      .logo{
        position: absolute;
        left: 30px;
        top: 50%;
        margin-top: -($lh/2);
        width: $lh;
        height: $lh;
      }
      .menu{
        margin-left: $lh+60px;
        margin-right: 300px;
        background-color: transparent;
        border: none;
      }
      .extra{
        position: absolute;
        right: 30px;
        top: 50%;
        margin-top: -$lh/2;
        .search{
          display: inline-block;
          vertical-align: middle;

          :global(.el-input__suffix) {
            right: 8px;
          }
        }
        .notify{
          display: inline-block;
          vertical-align: middle;
          font-size: 18px;
          color: #AEB7C0;
          margin-left: $normalSpace;
          &:hover{
            cursor:pointer;
          }
        }
        .schedule{
          display: inline-block;
          vertical-align: middle;
          font-size: 18px;
          color: #AEB7C0;
          margin-left: 30px;
          &:hover{
            cursor:pointer;
          }
        }
        .navIcon{
          font-size: 18px;
          color: #AEB7C0;
          vertical-align: middle;
          margin-left: $normalSpace;
          cursor: pointer;

          i{
            display: inline-block;
            font-size: 20px;
            vertical-align: middle;
            line-height: 1;
          }
        }
        .qrCode{
          position:absolute;
          right:120px;
          top:40px;
          z-index:9999;
          width: 100px;
          height: 100px;
          background:#FFFFFF;
          padding: 12px;
          border-radius: 4px;
          box-shadow: 0px 0px 10px $strongTextColor;
        }
      }

    }
    .content{
      position: absolute;
      width: 100%;
      top: $navHeight;
      left: 0;
      bottom: 0;
      background-color: $normalBackColor;
    }
  }
  .dropMenu{
    max-height: 648px!important;
    overflow-y: auto!important;
  }
</style>
<style lang="stylus" scoped>
  @import "~style/common.styl";
  .new-progress-nav{
    margin:20px 0 10px;
    .new-progress-list {
      font-size: 13px;
      color: $textContent;
      cursor: pointer;
      display: block;
      height: 30px;
      margin-right: 30px;
      float: left;
      position: relative;
      .is-change{
        width: 60%;
        background: $purpleColor;
        display: block;
        height: 1px;
        margin: 5px auto;
      }
      .red-dot{
        width: 6px;
        height: 6px;
        background: $errorColor;
        position: absolute;
        right: -6px;
        top: 0;
        border-radius: 3px;
      }
    }
  }
</style>

