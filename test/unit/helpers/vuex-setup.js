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
    { stubs, getters = {}, propsData, methods, doBefore = () => {}, mocks } // doBefore receives store
  ) {
    const node = Object.assign({}, require(`../helpers/node_mock`))
    const modules = Modules({ node })
    let store = new Vuex.Store({
      getters: Object.assign({}, Getters, getters),
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
          localVue,
          store,
          stubs: Object.assign(
            {
              "router-link": true,
              "router-view": true
            },
            stubs
          ),
          propsData,
          methods,
          mocks: Object.assign(
            {
              $route: {}
            },
            mocks
          )
        })
    }
  }

  return {
    localVue,
    shallow: (
      componentConstructor,
      { stubs, getters, propsData, methods, doBefore, mocks } = {}
    ) =>
      init(componentConstructor, shallow, {
        stubs,
        getters,
        propsData,
        methods,
        doBefore
      }),
    mount: (
      componentConstructor,
      { stubs, getters, propsData, methods, doBefore, mocks } = {}
    ) =>
      init(componentConstructor, mount, {
        stubs,
        getters,
        propsData,
        methods,
        doBefore,
        mocks
      })
  }
}
