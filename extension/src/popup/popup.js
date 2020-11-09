import Vue from 'vue'
import App from './App'
import Store from '../store'
import Router from './router'
import config from '../../config'
import Vuelidate from 'vuelidate'
import VueAnalytics from 'vue-analytics'
import VueClipboard from 'vue-clipboard2'
import Tooltip from 'vue-directive-tooltip'
import { focusElement, focusParentLast } from 'src/directives'
import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations'
import { createApolloProvider } from './gql/apollo.js'

global.browser = require('webextension-polyfill')
Vue.prototype.$browser = global.browser

const apolloProvider = createApolloProvider()
const apolloClient = apolloProvider
  ? apolloProvider.clients.defaultClient
  : null
const store = Store({ apollo: apolloClient })
store.dispatch('loadLocalAccounts')
store.dispatch(`preloadNetworkCapabilities`)
const router = Router(store)

Vue.use(Tooltip, { delay: 1 })
Vue.use(Vuelidate)
Vue.use(VueClipboard)
Vue.directive(`focus`, focusElement)
Vue.directive(`focus-last`, focusParentLast)

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
  apolloProvider,
  render: (h) => h(App)
})
