import Router from "vue-router"
import routes from "./routes"
import Vue from "vue"

/* istanbul ignore next */
Vue.use(Router)

export const routeGuard = store => async (to, from, next) => {
  // Redirect if fullPath begins with a hash (fallback for old pre history mode urls)
  if (to.fullPath.includes("#")) {
    const path = to.fullPath.substr(to.fullPath.indexOf("#") + 1)
    next(path)
    return
  }

  if (!(await featureAvailable(store, to))) {
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
async function featureAvailable(store, to) {
  await waitForAvailable(() => store.state.networks.network)
  if (
    to.meta.feature &&
    !store.state.networks.network[`feature_${to.meta.feature.toLowerCase()}`]
  ) {
    return false
  }

  return true
}
