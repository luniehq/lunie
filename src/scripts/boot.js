"use strict"
/**
 * Main module
 * @module main
 */

import _Vue from "vue"
import Router from "vue-router"
import Tooltip from "vue-directive-tooltip"
import Vuelidate from "vuelidate"
import VueClipboard from "vue-clipboard2"
import * as _Sentry from "@sentry/browser"

import App from "../App"
import routes from "../routes"
import _Node from "../connectors/node"
import _Store from "../vuex/store"
import * as urlHelpers from "scripts/url.js"
import _config from "src/config"
import {
  enableGoogleAnalytics,
  setGoogleAnalyticsPage
} from "scripts/google-analytics"
import { focusElement, focusParentLast } from "../directives"
const _enableGoogleAnalytics = enableGoogleAnalytics
const _setGoogleAnalyticsPage = setGoogleAnalyticsPage

import { processLunieExtensionMessages } from "scripts/extension-utils"

export const routeGuard = store => (to, from, next) => {
  if (from.fullPath !== to.fullPath && !store.getters.session.pauseHistory) {
    store.commit(`addHistory`, from.fullPath)
  }

  if (to.redirectedFrom == `/staking` && store.state.session.signedIn) {
    to = Object.assign({}, to, {
      path: `/staking/my-delegations`,
      fullPath: `/staking/my-delegations`,
      name: `My Delegations`
    })
    next(to.path)
  }
  next()
}

/**
 * Start the Vue app
 */
export const startApp = async (
  urlParams,
  config,
  Node = _Node,
  Store = _Store,
  env = process.env,
  Sentry = _Sentry,
  Vue = _Vue,
  enableGoogleAnalytics = _enableGoogleAnalytics,
  setGoogleAnalyticsPage = _setGoogleAnalyticsPage
) => {
  Vue.use(Router)
  Vue.use(Tooltip, { delay: 1 })
  Vue.use(Vuelidate)
  Vue.use(VueClipboard)

  Vue.directive(`focus`, focusElement)
  Vue.directive(`focus-last`, focusParentLast)

  // add error handlers in production
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

    enableGoogleAnalytics(config.google_analytics_uid)
  }

  const stargate = urlParams.stargate || config.stargate
  console.log(`Expecting stargate at: ${stargate}`)

  const node = Node(stargate)
  const store = Store({ node })
  const router = new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes
  })

  setGoogleAnalyticsPage(router.currentRoute.path)
  router.beforeEach(routeGuard(store))
  router.afterEach(to => {
    /* istanbul ignore next */
    setGoogleAnalyticsPage(to.path)
  })

  if (urlParams.experimental) {
    store.commit(`setExperimentalMode`)
  }
  if (urlParams.rpc) {
    store.commit(`setRpcUrl`, urlParams.rpc)
  }
  if (urlParams.insecure) {
    store.commit(`setInsecureMode`)
  }

  store.dispatch(`showInitialScreen`)
  store.dispatch(`loadLocalPreferences`)
  store
    .dispatch(`connect`)
    // wait for connected as the check for session will sign in directly and query account data
    .then(() => {
      store.dispatch(`checkForPersistedSession`)
    })

  window.addEventListener("message", processLunieExtensionMessages(store))

  return new Vue({
    router,
    ...App,
    store
  }).$mount(`#app`)
}

/**
 * Main method to prepare the boot process. It acts as the entrypoint.
 */
export const main = async (
  getURLParams = urlHelpers.getURLParams,
  start = startApp,
  config = _config
) => {
  const params = getURLParams(window)
  await start(params, config)
}
