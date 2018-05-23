import Vue from 'vue'
import Vuex from 'vuex'
import * as getters from './getters'
import roundState from './modules/round_state'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  getters,
  modules: {
    roundState
  },
  mutations: {},
  actions: {},
  strict: debug
})
