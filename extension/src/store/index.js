import Vue from 'vue'
import Vuex from 'vuex'
import Vuelidate from 'vuelidate'

import * as getters from './getters'
import * as mutations from './mutations'
import actions from './actions'

Vue.use(Vuex)
Vue.use(Vuelidate)

export default (opts = {}) => {
  return new Vuex.Store({
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
        signUpWarning: false,
        signUpSeed: ``
      },
      recover: {
        seed: ``,
        name: ``,
        password: ``,
        passwordConfirm: ``
      },
      session: {
        HDPath: undefined,
        curve: undefined,
        allSessionAddresses: []
      },
      network: '',
      networkSlug: `cosmos-hub`,
      networks: [],
      connection: {
        network: ""
      }
    },
    getters,
    actions: actions(opts),
    mutations
  })
}
