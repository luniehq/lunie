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
    },
    signup: {
      signUpName: ``,
      signUpPassword: ``,
      signUpPasswordConfirm: ``,
      signUpWarning: true,
      signUpSeed: ``
    },
    recover: {
      seed: ``,
      name: ``,
      password: ``,
      passwordConfirm: ``
    }
  },
  getters,
  modules,
  actions,
  mutations
})
