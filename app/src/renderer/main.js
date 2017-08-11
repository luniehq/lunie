import Vue from 'vue'
import Electron from 'vue-electron'
import Resource from 'vue-resource'
import Router from 'vue-router'
import Vuelidate from 'vuelidate'
import watt from 'watt'

import App from './App'
import routes from './routes'
import Node from './node'
import Store from './vuex/store'

Vue.use(Electron)
Vue.use(Resource)
Vue.use(Router)
Vue.use(Vuelidate)

const main = watt(function * (next) {
  const node = yield Node()

  const router = new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes
  })

  const store = Store({ node })
  store.dispatch('startPollingNodeStatus')
  store.dispatch('startCandidateInterval')
  store.dispatch('initializeWallet')

  return new Vue({
    router,
    ...App,
    store
  }).$mount('#app')
})

main().catch(function (err) { throw err })
