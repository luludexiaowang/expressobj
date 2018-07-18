import Vue from 'vue'
import App from 'client/views/app.vue'
import ElementUI from 'element-ui'
import 'client/assets/styles/element-theme/index.css'
import 'client/assets/styles/global.styl'
import router from 'client/router/index.js'

Vue.config.productionTip = false

const vueBoot = () => {
  Vue.use(ElementUI)
  new Vue({
    router,
    render: h => h(App)
  }).$mount('#app')
}

vueBoot()
