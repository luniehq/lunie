import router from "vue-router"
import routes from "./routes"
import Vue from "vue"

/* istanbul ignore next */
Vue.use(router)

/* istanbul ignore next */
const Router = (store) =>
  new router({
    mode: process.env.VUE_APP_E2E ? undefined : "history",
    routes: routes(store),
  })

export default Router
