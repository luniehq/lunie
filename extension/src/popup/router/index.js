import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'

export const focusParentLast = {
  inserted: (el) => {
    if (!el.contains(document.activeElement)) {
      el.focus()
    }
  }
}

Vue.use(VueRouter)
Vue.directive(`focus-last`, focusParentLast)

export default (store) => {
  return new VueRouter({
    routes: routes(store)
  })
}
