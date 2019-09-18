import Router from "vue-router"
import routes from "./routes"
import { NetworkCapability, NetworkCapabilityResult } from "./gql"
import Vue from "vue"
import config from "src/config.js"

/* istanbul ignore next */
Vue.use(Router)

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
    !config.e2e && // TODO remove once we have Hasura integrated in e2e tests
    !(await featureAvailable(apollo, store.state.connection.network, to))
  ) {
    next(`/feature-not-available/${to.meta.feature}`)
    return
  }

  if (from.fullPath !== to.fullPath && !store.state.session.pauseHistory) {
    store.commit(`addHistory`, from.fullPath)
  }

  next()
}

/* istanbul ignore next */
const router = new Router({
  mode: process.env.VUE_APP_E2E ? undefined : "history",
  scrollBehavior: () => ({ y: 0 }),
  routes
})

export default router

// check if feature is allowed and redirect if not
async function featureAvailable(apollo, networkId, to) {
  const { data } = await apollo.query({
    query: NetworkCapability(
      networkId,
      `feature_${to.meta.feature.toLowerCase()}`
    )
  })
  return NetworkCapabilityResult(data)
}
