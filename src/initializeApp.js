/* istanbul ignore file: really just integrations */

import { listenToExtensionMessages } from "scripts/extension-utils"
import {
  enableGoogleAnalytics,
  setGoogleAnalyticsPage
} from "scripts/google-analytics"
import config from "src/../config"
import Router, { routeGuard } from "./router"
import Store from "./vuex/store"
import { createApolloProvider } from "src/gql/apollo.js"

// remove any existing service worker
if (navigator && navigator.serviceWorker) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
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
    enableGoogleAnalytics(config.google_analytics_uid)
  }

  console.log(`Expecting backend at: ${config.graphqlHost}`)

  const apolloProvider = await createApolloProvider()
  const apolloClient = apolloProvider.clients.defaultClient

  const store = Store({ apollo: apolloClient })

  const router = Router(store)
  setGoogleAnalyticsPage(router.currentRoute.path)
  router.beforeEach(routeGuard(store))
  router.afterEach(to => {
    /* istanbul ignore next */
    setGoogleAnalyticsPage(to.path)
  })

  setOptions(urlParams, store)

  await store.dispatch(`preloadNetworkCapabilities`)
  store.dispatch(`loadLocalPreferences`)
  await store.dispatch(`checkForPersistedNetwork`) // wait until signin
  store.dispatch(`checkForPersistedAddresses`)

  listenToExtensionMessages(store)

  return { store, router, apolloProvider }
}
