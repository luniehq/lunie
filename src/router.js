import Router from "vue-router"
import routes from "./routes"
import Vue from "vue"

/* istanbul ignore next */
Vue.use(Router)

export const routeGuard = store => (to, from, next) => {
  if (from.fullPath !== to.fullPath && !store.state.session.pauseHistory) {
    store.commit(`addHistory`, from.fullPath)
  }

  next()
}

/* istanbul ignore next */
const router = new Router({
  mode: process.env.VUE_APP_E2E ? "history" : undefined,
  scrollBehavior: () => ({ y: 0 }),
  routes
})

export default router
