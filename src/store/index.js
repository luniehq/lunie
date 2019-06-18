import Vue from 'vue';
import Vuex from 'vuex';
import Vuelidate from 'vuelidate';

import * as getters from './getters';

Vue.use(Vuex);
Vue.use(Vuelidate);

const modules = {
  session: require('modules/session.js').default({}),
};

export default new Vuex.Store({
  state: {
    route: 'welcome',
  },
  getters,
  modules,
  mutations: {
    setSessionModalView: (state, view) => {
      console.log('view', view);
      state.route = view;
    },
  },
});
