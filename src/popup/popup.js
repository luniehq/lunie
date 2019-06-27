import Vue from 'vue';
import App from './App';
import store from '../store';
import router from './router';
import Tooltip from 'vue-directive-tooltip';
import Vuelidate from 'vuelidate';
import VueClipboard from 'vue-clipboard2';
import { focusElement } from 'src/directives';

global.browser = require('webextension-polyfill');
Vue.prototype.$browser = global.browser;

store.dispatch('loadAccounts');

Vue.use(Tooltip, { delay: 1 });
Vue.use(Vuelidate);
Vue.use(VueClipboard);
Vue.directive(`focus`, focusElement);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App),
});
