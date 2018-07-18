<template>
  <div :class="$style.root">
    <div :class="$style.content">
      <img :class="$style.logo" src="~assets/images/logo.png"/>
      <h1 :class="$style.brandName">小鹿猪</h1>
      <div :class="$style.loginForm">
        <form>
          <country-code :class="$style.countryCode" :code-value.sync="form.cc"></country-code>
          <div :class="$style.mobilePhone" class="clearfix">
            <el-input
              :class="$style.phone"
              placeholder="请输入手机号"
              v-model="form.phone">
            </el-input>
          </div>
          <div :class="$style.password">
            <el-input
              type="password"
              placeholder="请输入密码"
              v-model="form.password">
            </el-input>
          </div>
        </form>
      </div>
      <!-- <div id="captcha" @click="otherPassword = form.password">
        <p id="wait" :class="$style.show" v-if="showWait">正在加载验证码......</p>
      </div> -->
      <div :class="$style.forgetBtn">
        <span >忘记密码?</span>
      </div>
      <div v-loading="loading" :class="$style.loginBut">登录</div>
      <p :class="$style.browserTip">*请优先使用<b>Chrome</b>浏览器登录以获得最佳产品体验</p>
    </div>
  </div>
</template>
<script>
import CountryCode from 'client/component/country-code'

export default{
  components: {
    CountryCode
  },
  data () {
    return {
      showWait: true,
      captchaObj: {},
      otherPassword: '',
      loading: false,
      qrText: '',
      size: 100,
      qrcodeShow: false,
      ifInsert: false,
      telprefix: '',
      form: {
        cc: '86',
        phone: '',
        password: ''
      }
    }
  },
  created () {
  },
  methods: {

  }
}
</script>

<style lang="stylus" module>
  @import "~style/common.styl";
  .root{
    width: 100%
    height: 100%
    position: relative
    background: $mainColorTone
    .content{
      position: absolute
      left: 50%
      top: 50%
      transform: translate(-50%, -50%)
      width : 340px
      background: #ffffff
      padding: 40px 60px
      border-radius: 8px
      height 350px
      .show{
        font-size: 13px
        text-align: center
        color:$firstTextColor
      }
      .logo{
        margin: 0 auto
        display: block
        width: 40px
        height: 40px
      }
      .brandName{
        color: $mainColorTone
        text-align: center
        font-weight: 500
        font-size: 18px
        margin: 14px 0 40px
      }
      .loginForm{
        width: 340px
        .countryCode {
          width: 110px
          float: left
          :global(.el-input__inner){
            border: none
            padding: 0
          }
        }
        .mobilePhone{
          width: 340px
          border-bottom: 1px solid $ordinaryLineColor
          margin-bottom: 20px
          :global(.el-input__inner){
            border: none
            padding: 0
          }
          .phone {
            width: 230px
            float: right
          }
        }
        .password{
          border-bottom: 1px solid $ordinaryLineColor
          margin-bottom: 20px
          :global(.el-input__inner){
            border: none
            padding: 0
          }
        }
      }
      .forgetBtn {
        color: $linkColor;
        font-size: 14px
        text-align: right
        padding-top: 10px
        span {
          cursor: pointer
        }
      }
      .loginBut {
        margin-top: 24px
        margin-bottom: 14px
        border-radius: 4px
        background: $buttonColor
        height: 50px
        line-height: 50px
        text-align: center
        font-size: 14px
        color: #FFFFFF
        cursor: pointer
      }
      .browser-tip {
        color: $secondTextColor
        font-size: 13px
        text-align: center
        b {
          color: $strongTextColor
        }
      }
      .appQrcode{
        position: absolute
        left: 0
        right: 0
        bottom: -50px
        text-align: center
        .pic {
          width: 100px
          height: 100px
          position: absolute
          left: 50%
          transform: translate(-50%, 0)
          bottom: 26px
          background:#FFFFFF
          padding: 12px
          border-radius: 4px
          box-shadow: 0px 0px 10px $strongTextColor
          .pointIco {
            width: 16px
            height: 16px
            background: #FFFFFF
            position: absolute
            bottom: -4px
            left: 50%
            z-index: 1
            margin-left: -8px
            transform: rotate(45deg)
          }
        }
        p{
          font-size: 13px
          color: #FFFFFF
          margin: 0
          text-align: center
          cursor: pointer
          &:hover {
            color: $buttonColor
          }
        }
      }
    }
  }
</style>
