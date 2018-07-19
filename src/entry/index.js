import Vue from 'vue';
import router from 'router';
import store from 'store/index';
import Root from 'view';
import vTap from 'v-tap';
// import VConsole from 'vconsole';

/* eslint-disable no-new */
// new VConsole();

(() => {
  const HASH = /#([\s\S]+)$/;

  function getQuery(url) {
    const result = {};
    const strs = url.match(/\?([\s\S]+)/);
    if (strs && strs[1]) {
      const blocks = strs[1].split('&');
      blocks.forEach(block => {
        const kv = block.split('=');
        if (kv.length === 2) {
          result[kv[0]] = decodeURIComponent(kv[1]);
        }
      });
    }
    return result;
  }

  function getQueryParam() {
    const url = window.location.href;
    return getQuery(url.replace(HASH, ''));
  }

  window.config = getQueryParam();
})();
const vueBoot = () => {
  Vue.use(vTap);
  new Vue({
    router,
    store,
    components: {
      Root,
    },
    template: '<Root/>',
  }).$mount('#app');
};
vueBoot();
