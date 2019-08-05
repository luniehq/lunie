import Router from "vue-router"
import routes from "./routes"
import Vue from "vue"

/* istanbul ignore next */
Vue.use(Router)

export const routeGuard = store => (to, from, next) => {
  if (from.fullPath !== to.fullPath && !store.getters.session.pauseHistory) {
    store.commit(`addHistory`, from.fullPath)
  }

  if (to.redirectedFrom == `/staking` && store.state.session.signedIn) {
    to = Object.assign({}, to, {
      path: `/staking/my-delegations`,
      fullPath: `/staking/my-delegations`,
      name: `My Delegations`
    })
    next(to.path)
  }
  next()
}

/* istanbul ignore next */
const router = new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes
})

export default router
