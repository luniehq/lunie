import Vue from 'vue'
import Electron from 'vue-electron'
import Resource from 'vue-resource'
import Router from 'vue-router'
import Vuelidate from 'vuelidate'
import watt from 'watt'

import App from './App'
import routes from './routes'
import Basecoin from './basecoin'
import Store from './vuex/store'

Vue.use(Electron)
Vue.use(Resource)
Vue.use(Router)
Vue.use(Vuelidate)
Vue.config.debug = true

const main = watt(function * (next) {
  const basecoin = yield Basecoin()

  const router = new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes
  })

  const store = Store({ basecoin })

  return new Vue({
    router,
    ...App,
    store
  }).$mount('#app')
})

main()
