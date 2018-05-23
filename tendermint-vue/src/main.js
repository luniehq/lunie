import Vue from 'vue'
import App from './App.vue'
import store from './store'
import moment from 'moment'
import VueProgress from './components/vue-progress'

Vue.config.productionTip = false

// Add debug functions for all components.
Vue.mixin({
  methods: {
    capture: (o) => {
      let name = 'foo'
      if (name == null) {
        name = 'capture'
      } else {
        name = 'capture_' + name
      }
      window[name] = o
      console.log("debug set '" + name + "' to " + o)
      return o
    }
  }
})

// Add progress-bar plugin.
Vue.use(VueProgress)

// Add filters.
Vue.filter('formatDate', function (value) {
  if (value) {
    return moment(String(value)).utc().format('YYYY-MM-DD HH:mm:ss UTC')
  }
})

new Vue({
  methods: {
    hello: function () {
      console.log('hello')
    }
  },
  store,
  render: h => h(App)
}).$mount('#app')
