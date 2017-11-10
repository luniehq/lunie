import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import modules from './modules'

Vue.use(Vuex)

export default (opts = {}) => {
  opts.commit = (...args) => store.commit(...args)

  var store = new Vuex.Store({
    actions,
    getters,
    // strict: true,
    modules: modules(opts)
  })
  return store
}
