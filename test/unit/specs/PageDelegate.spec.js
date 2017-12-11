import Vuex from 'vuex'
// import Vuelidate from 'vuelidate'
import { mount, createLocalVue } from 'vue-test-utils'
import htmlBeautify from 'html-beautify'
import PageDelegate from 'renderer/components/staking/PageDelegate'

const user = require('renderer/vuex/modules/user').default({})
const shoppingCart = require('renderer/vuex/modules/shoppingCart').default({})

const localVue = createLocalVue()
localVue.use(Vuex)
// localVue.use(Vuelidate)

describe('PageDelegate', () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store({
      modules: { user, shoppingCart }
    })
    wrapper = mount(PageDelegate, {
      localVue,
      store
    })
    store.commit = jest.fn()
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })
})
