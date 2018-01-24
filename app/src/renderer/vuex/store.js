import Vue from 'vue'
import Vuex from 'vuex'
import * as getters from './getters'
import modules from './modules'

Vue.use(Vuex)

export default (opts = {}) => {
  opts.commit = (...args) => store.commit(...args)
  opts.dispatch = (...args) => store.dispatch(...args)
  var store = new Vuex.Store({
    getters,
    // strict: true,
    modules: modules(opts)
  })
  return store
}
