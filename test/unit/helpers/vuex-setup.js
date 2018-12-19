import Vuex from "vuex"
import Vuelidate from "vuelidate"
import VueRouter from "vue-router"
import { shallow, mount, createLocalVue } from "@vue/test-utils"
import { getCommits, getDispatches } from "./vuex-helpers.js"

import routes from "renderer/routes"
const Modules = require(`renderer/vuex/modules`).default
const Getters = require(`renderer/vuex/getters`)

export default function vuexSetup() {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(Vuelidate)
  localVue.use(VueRouter)
  localVue.directive(`tooltip`, () => {})
  localVue.directive(`focus`, () => {})

  function init(
    componentConstructor,
    testType = shallow,
    { doBefore = () => {}, ...args } // doBefore receives store
  ) {
    const node = Object.assign({}, require(`../helpers/node_mock`))
    const modules = Modules({ node })
    let store = new Vuex.Store({
      getters: Object.assign({}, Getters, args.getters),
      modules,
      actions: {
        loadPersistedState: () => {}
      }
    })
    store.commit(`setDevMode`, true)

    jest.spyOn(store, `dispatch`)
    jest.spyOn(store, `commit`)

    // helpers to make it easier to search events
    store.getCommits = getCommits.bind(this, store)
    store.getDispatches = getDispatches.bind(this, store)

    let router = new VueRouter({ routes })
    router.beforeEach((to, from, next) => {
      if (from.fullPath !== to.fullPath && !store.getters.user.pauseHistory)
        store.commit(`addHistory`, from.fullPath)
      next()
    })

    // execute some preparation logic on the store or router before mounting
    doBefore({ store, router })

    return {
      node,
      store,
      wrapper:
        componentConstructor &&
        testType(componentConstructor, {
          ...args,
          localVue,
          store,
          router
        })
    }
  }

  return {
    localVue,
    shallow: (componentConstructor, args = {}) =>
      init(componentConstructor, shallow, args),
    mount: (componentConstructor, args = {}) =>
      init(componentConstructor, mount, args)
  }
}
