import Vue from 'vue'
import Electron from 'vue-electron'
import Resource from 'vue-resource'
import Router from 'vue-router'
import { ipcRenderer } from 'electron'
import watt from 'watt'

import App from './App'
import routes from './routes'
import basecoin from './basecoin'

Vue.use(Electron)
Vue.use(Resource)
Vue.use(Router)
Vue.config.debug = true

const main = watt(function * (next) {
  yield ipcRenderer.once('basecoin-ready', next.arg(0))
  console.log('basecoin initialized')

  const router = new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes
  })

  return new Vue({
    router,
    ...App,
    ...(yield basecoin())
  }).$mount('#app')
})

main()
