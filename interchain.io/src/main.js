import Vue from 'vue'
import VueScrollTo from 'vue-scrollto'
import App from './App'
import router from './router'

Vue.config.productionTip = false

Vue.use(VueScrollTo, {
  container: 'body',
  duration: 500,
  easing: 'ease',
  offset: 0,
  cancelable: true,
  onDone: false,
  onCancel: false,
  x: false,
  y: true
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
