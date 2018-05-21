// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueAnalytics from 'vue-analytics'
import VueHead from 'vue-head'
import VueRouter from 'vue-router'
import VueScrollTo from 'vue-scrollto'

import App from './App'

// sync store and router
import { sync } from 'vuex-router-sync'
import store from './store/index.js'
import router from './router/index.js'
sync(store, router)

Vue.use(VueAnalytics, {id: 'UA-51029217-2', router: router})
Vue.use(VueHead)
Vue.use(VueRouter)
Vue.use(VueScrollTo, {
  container: 'body',
  duration: 500,
  easing: 'ease',
  offset: -48,
  cancelable: true,
  onDone: false,
  onCancel: false,
  x: false,
  y: true
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router: router,
  render: h => h(App)
})
