import Vue from 'vue'
import App from './App'
import store from '../store'
import router from './router'
import config from '../../config'
import Vuelidate from 'vuelidate'
import VueAnalytics from 'vue-analytics'
import VueClipboard from 'vue-clipboard2'
import Tooltip from 'vue-directive-tooltip'
import { focusElement } from 'src/directives'
import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations'

global.browser = require('webextension-polyfill')
Vue.prototype.$browser = global.browser

store.dispatch('loadAccounts')

Vue.use(Tooltip, { delay: 1 })
Vue.use(Vuelidate)
Vue.use(VueClipboard)
Vue.directive(`focus`, focusElement)

if (config.sentry_dsn) {
  Sentry.init({
    dsn: config.sentry_dsn,
    integrations: [new Integrations.Vue({ Vue, attachProps: true })]
  })
}

if (config.google_analytics_uid !== '') {
  Vue.use(VueAnalytics, {
    id: config.google_analytics_uid,
    router,
    debug: {
      enable: config.development,
      sendHitTask: !config.development
    }
  })
}

router.beforeEach(async (to, from, next) => {
  const pendingSignRequests = !!(await store.dispatch('getSignRequest'))

  if (pendingSignRequests && to.name !== 'approve') {
    next('/approve')
  } else {
    next()
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})
