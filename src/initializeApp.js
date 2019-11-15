/* istanbul ignore file: really just integrations */

import { listenToExtensionMessages } from "scripts/extension-utils"
import {
  enableGoogleAnalytics,
  setGoogleAnalyticsPage
} from "scripts/google-analytics"
import config from "src/../config"
import router, { routeGuard } from "./router"
import Store from "./vuex/store"
import { createApolloProvider } from "src/gql/apollo.js"

function setOptions(urlParams, store) {
  if (urlParams.experimental) {
    store.commit(`setExperimentalMode`)
  }
  if (config.mobileApp || urlParams.insecure === `true`) {
    store.commit(`setInsecureMode`)
  }
  if (urlParams.network) {
    store.dispatch(`setNetwork`, { id: urlParams.network })
  }
}


export default function init(urlParams, env = process.env) {
  // add error handlers in production
  if (env.NODE_ENV === `production`) {
    enableGoogleAnalytics(config.google_analytics_uid)
  }

  console.log(`Expecting backend at: ${config.graphqlHost}`)

  const apolloProvider = createApolloProvider(urlParams)
  const apolloClient = apolloProvider.clients.defaultClient

  const store = Store({ apollo: apolloClient })

  setGoogleAnalyticsPage(router.currentRoute.path)
  router.beforeEach(routeGuard(store, apolloClient))
  router.afterEach(to => {
    /* istanbul ignore next */
    setGoogleAnalyticsPage(to.path)
  })

  setOptions(urlParams, store)

  store.dispatch(`loadLocalPreferences`)
  store.dispatch(`checkForPersistedSession`)
  store.dispatch(`checkForPersistedAddresses`)

  listenToExtensionMessages(store)

  return { store, router, apolloProvider }
}
