import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import modules from './modules'

Vue.use(Vuex)

export default (opts) => new Vuex.Store({
  actions,
  getters,
  modules: modules(opts),
  strict: true
})
