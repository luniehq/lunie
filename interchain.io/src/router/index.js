import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
import PageIndex from '@/components/PageIndex'

Vue.use(Router)
Vue.use(Meta)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'PageIndex',
      component: PageIndex
    }
  ]
})
