"use strict"
/**
 * Main module
 * @module main
 */

import _Vue from "vue"
import Router from "vue-router"
import Tooltip from "vue-directive-tooltip"
import Vuelidate from "vuelidate"
import * as Sentry from "@sentry/browser"

import App from "./App"
import routes from "./routes"
import _Node from "./connectors/node"
import _Store from "./vuex/store"
import axios from "axios"

const _config = require(`../config.json`)

// exporting this for testing
let store
let node
let router

// Sentry is used for automatic error reporting. It is turned off by default.
Sentry.init({})

// this will pass the state to Sentry when errors are sent.
// this would also sent passwords...
// Sentry.configureScope(scope => {
//   scope.setExtra(_Store.state)
// })

// handle uncaught errors
window.addEventListener(`unhandledrejection`, function(event) {
  Sentry.captureException(event.reason)
})
window.addEventListener(`error`, function(event) {
  Sentry.captureException(event.reason)
})

_Vue.use(Router)
_Vue.use(Tooltip, { delay: 1 })
_Vue.use(Vuelidate)

// directive to focus form fields
_Vue.directive(`focus`, {
  inserted: function(el) {
    el.focus()
  }
})

/**
 * Main method to boot the renderer. It act as Entrypoint
 */
export async function main(
  Vue = _Vue,
  Node = _Node,
  Store = _Store,
  config = _config
) {
  console.log(`Expecting lcd-server at ` + config.node_lcd)

  node = Node(axios, config.node_lcd)

  store = Store({ node })

  router = new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes
  })

  router.beforeEach((to, from, next) => {
    if (from.fullPath !== to.fullPath && !store.getters.user.pauseHistory)
      store.commit(`addHistory`, from.fullPath)
    next()
  })

  store.dispatch(`connect`)
  store.dispatch(`showInitialScreen`)

  return new Vue({
    router,
    ...App,
    store
  }).$mount(`#app`)
}

main()
