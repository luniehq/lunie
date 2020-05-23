/* istanbul ignore file */

import Vue from "vue"
import VTooltip from "v-tooltip"
import Vuelidate from "vuelidate"
import InfiniteScroll from "vue-infinite-scroll"
import VueClipboard from "vue-clipboard2"
import { focusElement, focusParentLast } from "src/directives"
import App from "./App.vue"
import init from "./initializeApp"
import { getURLParams } from "scripts/url"
import "@babel/polyfill"
import { Plugins } from "@capacitor/core"
import config from "src/../config"
import * as Sentry from "@sentry/browser"
import * as Integrations from "@sentry/integrations"
import "material-design-icons-iconfont/dist/material-design-icons.css"
import AsyncComputed from "vue-async-computed"

if (config.sentryDSN) {
  Sentry.init({
    dsn: config.sentryDSN,
    integrations: [new Integrations.Vue({ Vue, attachProps: true })],
    release: process.env.LUNIE_VERSION,
  })
}

Vue.config.productionTip = false

Vue.use(VTooltip)

Vue.use(Vuelidate)
Vue.use(VueClipboard)
Vue.use(InfiniteScroll)
Vue.use(AsyncComputed)

Vue.directive(`focus`, focusElement)
Vue.directive(`focus-last`, focusParentLast)

const urlParams = getURLParams(window)
init(urlParams).then(({ store, router, apolloProvider }) => {
  const { SplashScreen, StatusBar } = Plugins

  new Vue({
    router,
    ...App,
    store,
    apolloProvider,
    mounted() {
      if (config.mobileApp) {
        SplashScreen.hide()
        StatusBar.show()
      }
    },
  }).$mount("#app")
})
