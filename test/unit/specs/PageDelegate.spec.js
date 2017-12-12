import Vuex from 'vuex'
import VueRouter from 'vue-router'
import { mount, createLocalVue } from 'vue-test-utils'
import htmlBeautify from 'html-beautify'
import PageDelegate from 'renderer/components/staking/PageDelegate'

const user = require('renderer/vuex/modules/user').default({})
const shoppingCart = require('renderer/vuex/modules/shoppingCart').default({})
const notifications = require('renderer/vuex/modules/notifications').default({})

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueRouter)

describe('PageDelegate', () => {
  let wrapper, store, router

  beforeEach(() => {
    store = new Vuex.Store({
      modules: { user, shoppingCart, notifications },
      getters: {
        shoppingCart: () => shoppingCart.state.candidates,
        user: () => user.state
      }
    })
    router = new VueRouter({})
    wrapper = mount(PageDelegate, {
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
