import Router from "vue-router"
import routes from "./routes"
import Vue from "vue"

/* istanbul ignore next */
Vue.use(Router)

export const routeGuard = store => async (to, from, next) => {
  if (!featureAvailable(store, to)) {
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
  scrollBehavior: () => ({ y: 0 }),
  routes
})

export default router

// wait for a value to be available
async function waitForAvailable(selectorFn) {
  if (selectorFn() === null || selectorFn() === undefined) {
    await new Promise(resolve =>
      setTimeout(async () => {
        await waitForAvailable(selectorFn)
        resolve()
      }, 50)
    )
  }
}

// check if feature is allowed and redirect if not
async function featureAvailable(store, to, next) {
  await waitForAvailable(() => store.state.networks.network)
  if (
    to.meta.feature &&
    !store.state.networks.network[`feature_${to.meta.feature.toLowerCase()}`]
  ) {
    return false
  }

  return true
}
