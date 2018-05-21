import VueRouter from "vue-router"
import routesRedirects from "./routesRedirects.js"
import routesStatic from "./routesStatic.js"

const routes = [...routesRedirects, ...routesStatic]

const router = new VueRouter({
  mode: "history",
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      let name = to.hash.replace("#", "")
      let obj =
        document.querySelector(to.hash) ||
        document.querySelector(`[name="${name}"]`)

      let rect = obj.getBoundingClientRect()
      return {
        // selector: to.hash
        x: rect.left,
        y: rect.top - 48 - 16 - 8
      }
    } else {
      return { x: 0, y: 0 }
    }
  }
})

export default router
