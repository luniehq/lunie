import Vuex from "vuex"
import Vuelidate from "vuelidate"
import { shallow, mount, createLocalVue } from "@vue/test-utils"
import { getCommits, getDispatches } from "./vuex-helpers.js"

const Modules = require(`renderer/vuex/modules`).default
const Getters = require(`renderer/vuex/getters`)

export default function vuexSetup() {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(Vuelidate)
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

    doBefore({ store })

    return {
      node,
      store,
      wrapper:
        componentConstructor &&
        testType(componentConstructor, {
          ...args,
          localVue,
          store,
          stubs: Object.assign(
            {
              "router-link": true,
              "router-view": true
            },
            args.stubs
          ),
          mocks: Object.assign(
            {
              $route: {}
            },
            args.mocks
          )
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
