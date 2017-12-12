import Vuex from 'vuex'
import VueRouter from 'vue-router'
import { mount, createLocalVue } from 'vue-test-utils'
import htmlBeautify from 'html-beautify'
import PageBond from 'renderer/components/staking/PageBond'

const user = require('renderer/vuex/modules/user').default({})
const shoppingCart = require('renderer/vuex/modules/shoppingCart').default({})
const notifications = require('renderer/vuex/modules/notifications').default({})

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueRouter)

describe('PageBond', () => {
  let wrapper, store, router

  beforeEach(() => {
    store = new Vuex.Store({
      modules: { user, shoppingCart, notifications },
      getters: {
        shoppingCart: () => shoppingCart.state.delegates,
        user: () => user.state
      }
    })
    router = new VueRouter({})
    wrapper = mount(PageBond, {
      localVue,
      store,
      router
    })
    store.commit = jest.fn()
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })
})
