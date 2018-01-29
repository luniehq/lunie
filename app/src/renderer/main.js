import Vue from 'vue'
import Electron from 'vue-electron'
import Resource from 'vue-resource'
import Router from 'vue-router'
import Vuelidate from 'vuelidate'
import shrinkStacktrace from '../helpers/shrink-stacktrace.js'

import App from './App'
import routes from './routes'
import Node from './node'
import Store from './vuex/store'

Vue.config.errorHandler = (error, vm, info) => {
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

  const router = new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes
  })

  const store = Store({ node })

  let connected = await store.dispatch('checkConnection')
  if (connected) {
    store.dispatch('nodeSubscribe')
    store.dispatch('showInitialScreen')
  }

  return new Vue({
    router,
    ...App,
    store
  }).$mount('#app')
}

main().catch(function (err) { throw err })

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
