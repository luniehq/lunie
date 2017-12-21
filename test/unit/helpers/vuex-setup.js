import Vuex from 'vuex'
import VueRouter from 'vue-router'
import { shallow, mount, createLocalVue } from 'vue-test-utils'

import routes from 'renderer/routes'

const Modules = require('renderer/vuex/modules').default
const Getters = require('renderer/vuex/getters')

export default function vuexSetup () {
  const modules = Modules({
    node: require('../helpers/node_mock')
  })

  const localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(VueRouter)

  function init (componentConstructor, testType = shallow, {stubs, getters = {}, propsData}) {
    let store = new Vuex.Store({
      getters: Object.assign({}, Getters, getters),
      modules
    })
    store.commit('setDevMode', true)

    jest.spyOn(store, 'dispatch')
    jest.spyOn(store, 'commit')

    let router = new VueRouter({routes})

    return {
      store,
      router,
      wrapper: testType(componentConstructor, {
        localVue, store, router, stubs, propsData
      })
    }
  }

  return {
    localVue,
    shallow: (componentConstructor, {stubs, getters, propsData} = {}) => init(componentConstructor, shallow, {stubs, getters, propsData}),
    mount: (componentConstructor, {stubs, getters, propsData} = {}) => init(componentConstructor, mount, {stubs, getters, propsData})
  }
}
