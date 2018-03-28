import Vue from 'vue'
import Electron from 'vue-electron'
import Resource from 'vue-resource'
import Router from 'vue-router'
import Vuelidate from 'vuelidate'
import shrinkStacktrace from '../helpers/shrink-stacktrace.js'
import Raven from 'raven-js'
import { remote, ipcRenderer } from 'electron'
import enableGoogleAnalytics from './google-analytics.js'

const config = require('../../../config')

import App from './App'
import routes from './routes'
import Node from './connectors/node'
import Store from './vuex/store'

// exporting this for testing
let store

// setup sentry remote error reporting and google analytics
const analyticsEnabled = JSON.parse(remote.getGlobal('process').env.COSMOS_ANALYTICS)
if (analyticsEnabled) {
  console.log('Analytics enabled in browser')
  enableGoogleAnalytics(config.google_analytics_uid)
}
Raven.config(analyticsEnabled ? config.sentry_dsn_public : '').install()

// handle uncaught errors
window.addEventListener('unhandledrejection', function (event) {
  Raven.captureException(event.reason)
})
window.addEventListener('error', function (event) {
  Raven.captureException(event.reason)
})
Vue.config.errorHandler = (error, vm, info) => {
  Raven.captureException(error)
  shrinkStacktrace(error)
  return true
}

Vue.use(Electron)
Vue.use(Resource)
Vue.use(Router)
Vue.use(Vuelidate)

async function main () {
  let lcdPort = getQueryParameter('lcd_port')
  console.log('Expecting lcd-server on port:', lcdPort)
  const node = Node('localhost:45667', lcdPort)

  const router = new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes
  })

  store = Store({ node })

  ipcRenderer.on('error', (event, error) => {
    store.commit('setModalError', true)
    store.commit('setModalErrorMessage', error.message)
  })

  let firstStart = true
  ipcRenderer.on('connected', (event, nodeIP) => {
    node.rpcConnect(nodeIP)
    store.dispatch('rpcSubscribe')
    store.dispatch('subscribeToBlocks')

    if (firstStart) {
      store.dispatch('showInitialScreen')

      // test connection
      node.lcdConnected()
        .then(connected => {
          if (connected) {
            ipcRenderer.send('successful-launch')
          }
        })

      firstStart = false
    }
  })

  ipcRenderer.send('booted')

  new Vue({
    router,
    ...App,
    store
  }).$mount('#app')
}

main().catch(function (err) {
  throw err
})

// exporting this for testing
module.exports.store = store

function getQueryParameter (name) {
  let queryString = window.location.search.substring(1)
  let pairs = queryString.split('&')
    .map(pair => pair.split('='))
    .filter(pair => pair[0] === name)
  if (pairs.length > 0) {
    return pairs[0][1]
  }
  return null
}
