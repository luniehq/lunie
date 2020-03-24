import router from "vue-router"
import routes from "./routes"
import { NetworkCapability, NetworkCapabilityResult } from "./gql"
import Vue from "vue"

/* istanbul ignore next */
Vue.use(router)

export const routeGuard = (store, apollo) => async (to, from, next) => {
  // Set any open modal to false
  store.state.session.currrentModalOpen = false

  // Redirect if fullPath begins with a hash (fallback for old pre history mode urls)
  if (to.fullPath.includes("#")) {
    const path = to.fullPath.substr(to.fullPath.indexOf("#") + 1)
    next(path)
    return
  }
  if (
    to.meta.feature &&
    !(store.state.connection.network === "testnet") && // TODO remove once we have Hasura integrated in e2e tests
    !(await featureAvailable(apollo, store.state.connection.network, to)) &&
    !(
      (await featureAvailable(apollo, store.state.connection.network, to)) === 2
    )
  ) {
    next(`/feature-not-available/${to.meta.feature}`)
    return
  } else if (
    (await featureAvailable(apollo, store.state.connection.network, to)) === 2
  ) {
    next(`/feature-not-present/${to.meta.feature}`)
    return
  }

  if (from.fullPath !== to.fullPath && !store.state.session.pauseHistory) {
    store.commit(`addHistory`, from.fullPath)
  }

  next()
}

/* istanbul ignore next */
const Router = (apollo, store) =>
  new router({
    mode: process.env.VUE_APP_E2E ? undefined : "history",
    scrollBehavior: () => ({ y: 0 }),
    routes: routes(apollo, store)
  })

export default Router

// check if feature is allowed and redirect if not
async function featureAvailable(apollo, networkId, to) {
  if (to.meta.feature === undefined) {
    return
  } else {
    const feature = `feature_${to.meta.feature.toLowerCase()}`
    const { data } = await apollo.query({
      query: NetworkCapability(networkId)
    })
    console.log("data.network[feature]", data.network[feature])
    console.log(
      "Network Capability result",
      NetworkCapabilityResult(feature)(data)
    )
    return NetworkCapabilityResult(feature)(data)
  }
}
