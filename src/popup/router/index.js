import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'

Vue.use(VueRouter)

export default store => {
  return new VueRouter({
    routes: routes(store)
  })
}
