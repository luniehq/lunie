/* istanbul ignore file: really just integrations */

import { listenToExtensionMessages } from "scripts/extension-utils"
import { checkForNewLunieVersions } from "scripts/check-for-new-lunie-versions"
import {
  enableGoogleAnalytics,
  setGoogleAnalyticsPage,
} from "scripts/google-analytics"
import config from "src/../config"
import Router, { routeGuard } from "./router"
import Store from "./vuex/store"
import { createApolloProvider } from "src/gql/apollo.js"

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

export default async function init(urlParams, env = process.env) {
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
  await store.dispatch(`preloadNetworkCapabilities`)

  const router = Router(store)
  setGoogleAnalyticsPage(router.currentRoute.path)
  router.beforeEach(routeGuard(store))
  router.afterEach((to) => {
    /* istanbul ignore next */
    setGoogleAnalyticsPage(to.path)
  })

  setOptions(urlParams, store)

  store.dispatch(`loadLocalPreferences`)
  await store.dispatch(`checkForPersistedNetwork`) // wait until signin
  store.dispatch(`checkForPersistedAddresses`)

  listenToExtensionMessages(store)

  return { store, router, apolloProvider }
}
