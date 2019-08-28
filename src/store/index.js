import Vue from 'vue'
import Vuex from 'vuex'
import Vuelidate from 'vuelidate'

import * as getters from './getters'
import * as mutations from './mutations'
import * as actions from './actions'

Vue.use(Vuex)
Vue.use(Vuelidate)

const modules = {}

export default new Vuex.Store({
  state: {
    accounts: [],
    signRequest: null,
    session: {
      insecureMode: true
    }
  },
  getters,
  modules,
  actions,
  mutations
})
