import router from "vue-router"
import routes from "./routes"
import Vue from "vue"
import { setNetwork } from "./scripts/setNetwork"

/* istanbul ignore next */
Vue.use(router)

export const routeGuard = (store) => async (to, from, next) => {
  // set any open modal to false
  store.state.session.currrentModalOpen = false

  // fallback for old history mode url redirect if path includes a hash
  if (to.fullPath.includes("#")) {
    const path = to.fullPath.substr(to.fullPath.indexOf("#") + 1)
    next(path)
  }

  // redirect from notifications to paywall is user is not signed in
  if (to.name === `notifications`) {
    if (store.state.account.userSignedIn) {
      next()
    } else {
      next(`/notification-wall`)
      return
    }
  }

  // checks for feature flags and feature availability
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

  // manually set browser history
  if (from.fullPath !== to.fullPath && !store.state.session.pauseHistory) {
    store.commit(`addHistory`, from.fullPath)
  }

  // set network based on url params
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
    routes: routes(store),
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      } else {
        return { x: 0, y: 0 }
      }
    },
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

  const featureSelector = `feature_${feature}`
  return currentNetwork[featureSelector]
}
