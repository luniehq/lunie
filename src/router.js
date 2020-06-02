import router from "vue-router"
import routes from "./routes"
import Vue from "vue"
import { setNetwork } from "./scripts/setNetwork"

/* istanbul ignore next */
Vue.use(router)

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
    const featureAvalability = await featureAvailable(
      store,
      to.params.networkId,
      to.meta.feature
    )
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

  if (to.params.networkId) {
    await setNetwork({ to, from, next }, store)
  } else {
    next()
  }
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
async function featureAvailable(store, networkSlug, feature) {
  let networks = store.state.connection.networks
  if (networks.length === 0) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return featureAvailable(store, networkSlug, feature)
  }
  // we get the current network object
  const currentNetworkId = store.state.connection.network
  // we get the current network object
  const currentNetwork = networks.find(({ slug, id }) =>
    networkSlug ? slug === networkSlug : id === currentNetworkId
  )

  if (!currentNetwork) return "" // HACK route is not actually a network

  const featureSelector = `feature_${feature.toLowerCase()}`
  return currentNetwork[featureSelector]
}
