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

Vue.config.productionTip = false

Vue.use(Tooltip, { delay: 1 })
Vue.use(Vuelidate)
Vue.use(VueClipboard)
Vue.use(InfiniteScroll)

Vue.directive(`focus`, focusElement)
Vue.directive(`focus-last`, focusParentLast)

async function main() {
  const urlParams = getURLParams(window)
  const { store, router, apolloProvider } = await init(urlParams)

  new Vue({
    router,
    ...App,
    store,
    apolloProvider
  }).$mount("#app")
}

main()
