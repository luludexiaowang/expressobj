/* eslint-disable no-mixed-operators */
import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'

Vue.use(VueRouter)

const router = new VueRouter({
  // linkActiveClass: 'active-link',
  // linkExactActiveClass: 'exact-active-link',
  // mode: 'history',
  routes: [
    ...routes
  ]
})

export default router
