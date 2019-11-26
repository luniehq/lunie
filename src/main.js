/* istanbul ignore file */

import Vue from "vue"
import Tooltip from "vue-directive-tooltip"
import Vuelidate from "vuelidate"
import InfiniteScroll from "vue-infinite-scroll"
import VueClipboard from "vue-clipboard2"
import { focusElement, focusParentLast } from "src/directives"
import init from "./initializeApp"
import { getURLParams } from "scripts/url"
import "./registerServiceWorker"
import "@babel/polyfill"
import { Plugins } from "@capacitor/core"
import config from "src/../config"
import * as Sentry from "@sentry/browser"
import * as Integrations from "@sentry/integrations"
import "material-design-icons-iconfont/dist/material-design-icons.css"
const App = () => import("./App.vue")

if (config.sentryDSN) {
  Sentry.init({
    dsn: config.sentryDSN,
    integrations: [new Integrations.Vue({ Vue, attachProps: true })]
  })
}

Vue.config.productionTip = false

let tooltipOptions = { delay: 1 }
if (config.mobileApp) {
  tooltipOptions = { class: `hide` }
}
Vue.use(Tooltip, tooltipOptions)

Vue.use(Vuelidate)
Vue.use(VueClipboard)
Vue.use(InfiniteScroll)

Vue.directive(`focus`, focusElement)
Vue.directive(`focus-last`, focusParentLast)

const urlParams = getURLParams(window)
const { store, router, apolloProvider } = init(urlParams)
const { SplashScreen, StatusBar } = Plugins

new Vue({
  mounted() {
    if (config.mobileApp) {
      SplashScreen.hide()
      StatusBar.show()
    }
  },
  render: h => h(App),
  router,
  store,
  apolloProvider
}).$mount("#app")
