import Vue from 'vue';
import Vuex from 'vuex';
import Vuelidate from 'vuelidate';

import * as getters from './getters';
import * as mutations from './mutations';
import * as actions from './actions';

Vue.use(Vuex);
Vue.use(Vuelidate);

const modules = {
  // session: require('modules/session.js').default({}),
};

export default new Vuex.Store({
  state: {
    accounts: [],
    signRequest: null,
  },
  getters,
  modules,
  actions,
  mutations,
});
