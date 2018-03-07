import Vue from 'vue'
import Electron from 'vue-electron'
import Resource from 'vue-resource'
import Router from 'vue-router'
import Vuelidate from 'vuelidate'
import shrinkStacktrace from '../helpers/shrink-stacktrace.js'
import axios from 'axios'
import Raven from 'raven-js'
import { remote } from 'electron'
import enableGoogleAnalytics from './google-analytics.js'

const config = require('../../../config')

import App from './App'
import routes from './routes'
import Node from './node'
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
  let nodeIP = getQueryParameter('node')
  if (!nodeIP) {
    console.log('Did not receive a node to connect to')
    return
  }

  let relayPort = getQueryParameter('relay_port')
  console.log('Expecting relay-server on port:', relayPort)
  console.log('Connecting to node:', nodeIP)
  const node = Node(nodeIP, relayPort)

  node.lcdConnected()
    .then(connected => {
      if (connected) {
        axios.get(`http://localhost:${relayPort}/startsuccess`)
      }
    })

  const router = new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes
  })

  store = Store({ node })

  let error = getQueryParameter('error')
  if (error) {
    store.commit('setModalError', true)
    store.commit('setModalErrorMessage', error)
  } else {
    let connected = await store.dispatch('checkConnection')
    if (connected) {
      store.dispatch('nodeSubscribe')
      store.dispatch('showInitialScreen')
      store.dispatch('subscribeToBlocks')
    }
  }

  new Vue({
    router,
    ...App,
    store
  }).$mount('#app')
}

main().catch(function (err) { throw err })

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
