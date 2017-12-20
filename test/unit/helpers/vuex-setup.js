import Vuex from 'vuex'
import VueRouter from 'vue-router'
import { mount, createLocalVue } from 'vue-test-utils'

const Modules = require('renderer/vuex/modules').default
const Getters = require('renderer/vuex/getters')

export default function vuexSetup (getters = {}) {
  const modules = Modules({
    node: require('../helpers/node_mock')
  })

  const localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(VueRouter)

  let store = new Vuex.Store({
    getters: Object.assign({}, Getters, getters),
    modules
  })
  store.commit('setDevMode', true)
  let router = new VueRouter({})
  jest.spyOn(store, 'dispatch')
  jest.spyOn(store, 'commit')

  return {
    localVue,
    store,
    router,
    new: (componentConstructor, testType = mount, props = {}) => {
      return testType(componentConstructor, {
        localVue,
        store,
        router,
        propsData: props
      })
    }
  }
}

