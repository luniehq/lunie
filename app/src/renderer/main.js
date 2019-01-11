"use strict"
/**
 * Main module
 * @module main
 */

import Vue from "vue"
import Router from "vue-router"
import Tooltip from "vue-directive-tooltip"
import Vuelidate from "vuelidate"
import * as Sentry from "@sentry/browser"

import App from "./App"
import routes from "./routes"
import Node from "./connectors/node"
import Store from "./vuex/store"
import axios from "axios"
import { sleep } from "./scripts/common"

const config = require(`../../src/config.json`)

// exporting this for testing
let store
let node
let router

// Sentry is used for automatic error reporting. It is turned off by default.
Sentry.init({})

// this will pass the state to Sentry when errors are sent.
Sentry.configureScope(scope => {
  scope.setExtra(Store.state)
})

// handle uncaught errors
window.addEventListener(`unhandledrejection`, function(event) {
  Sentry.captureException(event.reason)
})
window.addEventListener(`error`, function(event) {
  Sentry.captureException(event.reason)
})

Vue.use(Router)
Vue.use(Tooltip, { delay: 1 })
Vue.use(Vuelidate)

// directive to focus form fields
Vue.directive(`focus`, {
  inserted: function(el) {
    el.focus()
  }
})

/**
 * Main method to boot the renderer. It act as Entrypoint
 */
async function main() {
  let lcdPort = config.development ? config.lcd_port : config.lcd_port_prod
  let localLcdURL = `https://localhost:${lcdPort}`
  console.log(`Expecting lcd-server on port: ` + lcdPort)

  node = Node(axios, localLcdURL, config.node_lcd, config.mocked)

  store = Store({ node })
  store.dispatch(`loadTheme`)

  router = new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes
  })

  router.beforeEach((to, from, next) => {
    if (from.fullPath !== to.fullPath && !store.getters.user.pauseHistory)
      store.commit(`addHistory`, from.fullPath)
    next()
  })

  // wait until backend was reached to connect
  new Promise(async () => {
    while (true) {
      try {
        await axios(config.node_lcd + `/node_version`)
        break
      } catch (err) {}
      await sleep(1000)
    }

    node.rpcConnect(config.node_rpc)
    store.dispatch(`rpcSubscribe`)
    store.dispatch(`subscribeToBlocks`)

    store.dispatch(`showInitialScreen`)
  })

  return new Vue({
    router,
    ...App,
    store
  }).$mount(`#app`)
}

main()

// exporting this for testing
module.exports.store = store
module.exports.node = node
module.exports.router = router
