import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import NiPage from 'common/NiPage'

const config = require('renderer/vuex/modules/config').default({})

const localVue = createLocalVue()
localVue.use(Vuex)

describe('NiPage', () => {
  let wrapper
  let store = new Vuex.Store({
    getters: { config: () => config.state },
    modules: { config }
  })
  store.commit = jest.fn()

  beforeEach(() => {
    store.commit.mockClear()
    wrapper = mount(NiPage, {
      localVue,
      store,
      propsData: {
        title: 'Title',
        subtitle: 'Subtitle',
        icon: 'hello_icon'
      },
      stubs: { 'app-footer': '<app-footer />' }
    })
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
