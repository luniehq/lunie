/* istanbul ignore file: really just integrations */

import { checkForNewLunieVersions } from "scripts/check-for-new-lunie-versions"
import {
  enableGoogleAnalytics,
  setGoogleAnalyticsPage,
} from "scripts/google-analytics"
import config from "src/../config"
import Router, { routeGuard } from "./router"
import Store from "./vuex/store"

if (navigator && navigator.serviceWorker) {
  // remove any existing service worker
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister()
    }
  })
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
  // add error handlers in production
  if (env.NODE_ENV === `production`) {
    // check every minute if new Lunie versions have been deployed
    checkForNewLunieVersions()
    enableGoogleAnalytics(config.google_analytics_uid)
  }

  const store = Store()

  const router = Router(store)
  setGoogleAnalyticsPage(router.currentRoute.path)

  store.dispatch(`loadLocalPreferences`)
  // store.dispatch(`checkForPersistedAddresses`)

  return { store, router }
}
