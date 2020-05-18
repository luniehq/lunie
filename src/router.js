import router from "vue-router"
import routes from "./routes"
import Vue from "vue"

/* istanbul ignore next */
Vue.use(router)

const networkCapabilityDictionary = {
  true: "ENABLED",
  false: "DISABLED",
  null: "MISSING",
}

export const routeGuard = (store) => async (to, from, next) => {
  // Set any open modal to false
  store.state.session.currrentModalOpen = false

  // Redirect if fullPath begins with a hash (fallback for old pre history mode urls)
  if (to.fullPath.includes("#")) {
    const path = to.fullPath.substr(to.fullPath.indexOf("#") + 1)
    next(path)
    return
  }
  if (to.meta.feature) {
    const featureAvalability = await featureAvailable(store, to.meta.feature)
    switch (featureAvalability) {
      case "DISABLED": {
        next(`/feature-not-available/${to.meta.feature}`)
        return
      }
      case "MISSING": {
        next(`/feature-not-present/${to.meta.feature}`)
        return
      }
      default: {
        // if the feature is enabled just continue
      }
    }
  }

  if (from.fullPath !== to.fullPath && !store.state.session.pauseHistory) {
    store.commit(`addHistory`, from.fullPath)
  }

  next()
}

/* istanbul ignore next */
const Router = (store) =>
  new router({
    mode: process.env.VUE_APP_E2E ? undefined : "history",
    scrollBehavior: () => ({ y: 0 }),
    routes: routes(store),
  })

export default Router

// check if feature is allowed and redirect if not
async function featureAvailable(store, feature) {
  const networks = store.state.connection.networks
  const currentNetworkId = store.state.connection.network
  // we get the current network object
  const currentNetwork = networks.find(({ id }) => id === currentNetworkId)
  const featureSelector = `feature_${feature.toLowerCase()}`
  return typeof currentNetwork[featureSelector] === "string"
    ? currentNetwork[featureSelector]
    : // DEPRECATE fallback for old API response
      networkCapabilityDictionary[currentNetwork[featureSelector]]
}
