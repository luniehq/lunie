import Router from "vue-router"
import routes from "./routes"
import Vue from "vue"

/* istanbul ignore next */
Vue.use(Router)

export const routeGuard = store => (to, from, next) => {
  // Redirect if fullPath begins with a hash (fallback for old pre history mode urls)
  if (to.fullPath.includes("#")) {
    const path = to.fullPath.substr(to.fullPath.indexOf("#") + 1)
    next(path)
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
