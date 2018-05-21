import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
function r (page) { return require('@/components/Page' + page) }

const routes = [
  { path: '/', component: r('Index') },
  { path: '/search', component: r('Search') },
  { path: '/block/:block', name: 'block', component: r('Block') },
  { path: '/validators', component: r('Validators') },
  {
    name: 'validator',
    path: '/validators/:validator',
    component: r('Validator')
  }
]

export default new Router({
  mode: 'history',
  routes: routes,
  scrollBehavior (to, from, savedPosition) {
    if (to.hash) {
      return {
        selector: to.hash
      }
    }
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})
