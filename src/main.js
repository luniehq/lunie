/* istanbul ignore file */

import Vue from "vue"
import Tooltip from "vue-directive-tooltip"
import Vuelidate from "vuelidate"
import InfiniteScroll from "vue-infinite-scroll"
import VueClipboard from "vue-clipboard2"
import { focusElement, focusParentLast } from "src/directives"
import App from "./App.vue"
import init from "./initializeApp"
import { getURLParams } from "scripts/url"
import "./registerServiceWorker"
import "@babel/polyfill"
import { Plugins } from "@capacitor/core"

Vue.config.productionTip = false

Vue.use(Tooltip, { delay: 1 })
Vue.use(Vuelidate)
Vue.use(VueClipboard)
Vue.use(InfiniteScroll)

Vue.directive(`focus`, focusElement)
Vue.directive(`focus-last`, focusParentLast)

const urlParams = getURLParams(window)
const { store, router, apolloProvider } = init(urlParams)
const { SplashScreen, StatusBar } = Plugins

new Vue({
  router,
  ...App,
  store,
  apolloProvider,
  mounted() {
    SplashScreen.hide()
    StatusBar.show()
  }
}).$mount("#app")
