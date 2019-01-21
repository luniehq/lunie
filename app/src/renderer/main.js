"use strict"
/**
 * Main module
 * @module main
 */

import Vue from "vue"
import Electron from "vue-electron"
import Router from "vue-router"
import Tooltip from "vue-directive-tooltip"
import Vuelidate from "vuelidate"
import * as _Sentry from "@sentry/browser"
import { ipcRenderer, remote } from "electron"

import App from "./App"
import routes from "./routes"
import Node from "./connectors/node"
import Store from "./vuex/store"
import AxiosProxy from "./scripts/axiosProxy"

const config = remote.getGlobal(`config`)

// exporting this for testing
let store
let node
let router

/* istanbul ignore next */
Vue.config.errorHandler = (error, vm, info) => {
  console.error(`An error has occurred: ${error}

Guru Meditation #${info}`)

  _Sentry.captureException(error)

  if (store.state.devMode) {
    throw error
  }
}

/* istanbul ignore next */
Vue.config.warnHandler = (msg, vm, trace) => {
  console.warn(`A warning has occurred: ${msg}

Guru Meditation #${trace}`)

  if (store.state.devMode) {
    throw new Error(msg)
  }
}

Vue.use(Electron)
Vue.use(Router)
Vue.use(Tooltip, { delay: 1 })
Vue.use(Vuelidate)

// directive to focus form fields
/* istanbul ignore next */
Vue.directive(`focus`, {
  inserted: function(el) {
    el.focus()
  }
})

/**
 * Main method to boot the renderer. It act as Entrypoint
 */
module.exports.main = async function main(env = process.env, Sentry = _Sentry) {
  if (env.NODE_ENV === `production`) {
    // Sentry is used for automatic error reporting. It is turned off by default.
    Sentry.init({})

    // this will pass the state to Sentry when errors are sent.
    // this would also sent passwords...
    // Sentry.configureScope(scope => {
    //   scope.setExtra(_Store.state)
    // })

    // handle uncaught errors
    /* istanbul ignore next */
    window.addEventListener(`unhandledrejection`, function(event) {
      Sentry.captureException(event.reason)
    })
    /* istanbul ignore next */
    window.addEventListener(`error`, function(event) {
      Sentry.captureException(event.reason)
    })
  }

  let lcdPort = config.development ? config.lcd_port : config.lcd_port_prod
  let localLcdURL = `https://localhost:${lcdPort}`
  console.log(`Expecting lcd-server on port: ` + lcdPort)

  node = Node(AxiosProxy(), localLcdURL, config.node_lcd, config.mocked)

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

  ipcRenderer.on(`error`, (event, err) => {
    switch (err.code) {
      case `NO_NODES_AVAILABLE`:
        store.commit(`setModalNoNodes`, true)
        break
      default:
        store.commit(`setModalError`, true)
        store.commit(`setModalErrorMessage`, err.message)
    }
  })
  ipcRenderer.on(`approve-hash`, (event, hash) => {
    console.log(hash)
    store.commit(`setNodeApprovalRequired`, hash)
  })

  let firstStart = true
  ipcRenderer.on(`connected`, (event, { rpcURL }) => {
    node.rpcConnect(rpcURL)
    store.dispatch(`rpcSubscribe`)
    store.dispatch(`subscribeToBlocks`)

    if (firstStart) {
      store.dispatch(`showInitialScreen`)

      // test connection
      node.lcdConnected().then(connected => {
        if (connected) {
          ipcRenderer.send(`successful-launch`)
        }
      })

      firstStart = false
    } else {
      store.dispatch(`reconnected`)
    }
  })

  ipcRenderer.send(`booted`)

  return new Vue({
    router,
    ...App,
    store
  }).$mount(`#app`)
}

// run
module.exports.main()

// exporting this for testing
module.exports.store = store
module.exports.node = node
module.exports.router = router
