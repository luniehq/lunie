/* istanbul ignore file: really just integrations */

import { Plugins } from "@capacitor/core"
import * as Sentry from "@sentry/browser"
const { App: CapacitorApp } = Plugins
import { listenToExtensionMessages } from "scripts/extension-utils"
import { checkForNewLunieVersions } from "scripts/check-for-new-lunie-versions"
import {
  enableGoogleAnalytics,
  setGoogleAnalyticsPage,
} from "scripts/google-analytics"
import config from "src/../config"
import Router, { routeGuard } from "./router"
import Store from "./vuex/store"
import { createApolloProvider, apolloErrorHandler } from "src/gql/apollo.js"
import { registerForPushNotifications } from "./scripts/pushNotifications"
import { handleDeeplink, getLaunchUrl } from "./vuex/modules/account"

if (navigator && navigator.serviceWorker) {
  // remove any existing service worker
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister()
    }
  })
}

function setOptions(urlParams, store) {
  if (urlParams.experimental) {
    store.commit(`setExperimentalMode`)
  }
  if (urlParams.insecure === `true`) {
    store.commit(`setInsecureMode`)
  }
  if (urlParams.network) {
    store.dispatch(`setNetwork`, { id: urlParams.network })
  }
}

export const bootError = (error) => {
  document.querySelector("#app").innerHTML = `
  <div class="boot-error">
    <h2>Uh oh. Lunie failed to start. Our team has been notified of the issue. Please try refreshing this page in a few minutes. If the error persists please contact us at http://help.lunie.io/</h2>

    <p class="error">${error}</p>
  </div>
    `
}

export default async function init(urlParams, env = process.env) {
  let initialized = false
  // add error handlers in production
  if (env.NODE_ENV === `production`) {
    // check every minute if new Lunie versions have been deployed
    checkForNewLunieVersions()
    enableGoogleAnalytics(config.google_analytics_uid)
  }

  console.log(`Expecting backend at: ${config.graphqlHost}`)

  const apolloProvider = await createApolloProvider()
  const apolloClient = apolloProvider.clients.defaultClient

  const store = Store({ apollo: apolloClient })

  // we need to use this custom error handler as we want to use the store in there
  // we can't pass the store as it would create a circular dependency
  apolloErrorHandler.onError((error) => {
    if (error.extensions && error.extensions.code === "UNAUTHENTICATED") {
      store.dispatch("signOutUser")
      return
    }
    Sentry.captureException(error)
    console.error(error)

    if (!initialized) {
      bootError(new Error("Failed to connect to API: " + error.message))
    }
  })

  // we need to set url params before querying for networks because of experimental flag
  setOptions(urlParams, store)

  // check if user is signed in
  store.dispatch(`listenToAuthChanges`) // handles Google OAuth changes we are not influencing
  await store.dispatch(`checkSession`)

  // we load the networks first as we need them in the router
  await store.dispatch(`preloadNetworkCapabilities`)

  const router = Router(store)
  setGoogleAnalyticsPage(router.currentRoute.path)
  router.beforeEach(routeGuard(store))
  router.afterEach((to) => {
    /* istanbul ignore next */
    setGoogleAnalyticsPage(to.path)
  })

  registerForPushNotifications(store, router)

  if (config.mobileApp) {
    CapacitorApp.addListener("appUrlOpen", function (data) {
      handleDeeplink(data.url, router)
    })
    // handling deeplinks when app is opening
    getLaunchUrl(router)
  } else {
    handleDeeplink(window.location, router)
  }

  store.dispatch(`loadLocalPreferences`)
  await store.dispatch(`checkForPersistedNetwork`) // wait until signin
  store.dispatch(`checkForPersistedAddresses`)

  listenToExtensionMessages(store)

  initialized = true

  return { store, router, apolloProvider }
}
