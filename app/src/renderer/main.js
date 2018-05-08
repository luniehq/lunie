import Vue from "vue"
import Electron from "vue-electron"
import Resource from "vue-resource"
import Router from "vue-router"
import Tooltip from "vue-directive-tooltip"
import Vuelidate from "vuelidate"
import shrinkStacktrace from "../helpers/shrink-stacktrace.js"
import Raven from "raven-js"
import { ipcRenderer } from "electron"

import App from "./App"
import routes from "./routes"
import Node from "./connectors/node"
import Store from "./vuex/store"
import config from "../config"

// exporting this for testing
let store
let node

// Raven serves automatic error reporting. It is turned off by default
Raven.config("").install()

// handle uncaught errors
window.addEventListener("unhandledrejection", function(event) {
  Raven.captureException(event.reason)
})
window.addEventListener("error", function(event) {
  Raven.captureException(event.reason)
})
Vue.config.errorHandler = (error, vm, info) => {
  Raven.captureException(error)
  shrinkStacktrace(error)
  return true
}

Vue.use(Electron)
Vue.use(Resource)
Vue.use(Router)
Vue.use(Tooltip)
Vue.use(Vuelidate)

async function main() {
  let lcdPort = getQueryParameter("lcd_port")
  console.log("Expecting lcd-server on port:", lcdPort)
  node = Node(lcdPort, config.mocked)

  const router = new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes
  })

  store = Store({ node })

  ipcRenderer.on("error", (event, error) => {
    store.commit("setModalError", true)
    store.commit("setModalErrorMessage", error.message)
  })
  ipcRenderer.on("approve-hash", (event, hash) => {
    console.log(hash)
    store.commit("setNodeApprovalRequired", hash)
  })

  let firstStart = true
  ipcRenderer.on("connected", (event, nodeIP) => {
    node.rpcConnect(nodeIP)
    store.dispatch("rpcSubscribe")
    store.dispatch("subscribeToBlocks")

    if (firstStart) {
      store.dispatch("showInitialScreen")

      // test connection
      node.lcdConnected().then(connected => {
        if (connected) {
          ipcRenderer.send("successful-launch")
        }
      })

      firstStart = false
    }
  })

  ipcRenderer.send("booted")

  new Vue({
    router,
    ...App,
    store
  }).$mount("#app")
}

main()

// exporting this for testing
module.exports.store = store
module.exports.node = node

function getQueryParameter(name) {
  let queryString = window.location.search.substring(1)
  let pairs = queryString
    .split("&")
    .map(pair => pair.split("="))
    .filter(pair => pair[0] === name)
  if (pairs.length > 0) {
    return pairs[0][1]
  }
  return null
}
