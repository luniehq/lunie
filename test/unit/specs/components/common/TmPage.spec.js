import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmPage from "renderer/components/common/TmPage"
import Vuex from "vuex"
const localVue = createLocalVue()

localVue.use(Vuex)

describe(`TmPage`, () => {
  let wrapper
  let actions
  let store
  let getters

  beforeEach(() => {
    getters = {
      session: () => ({ address: `cosmos`, atoms: 1 }),
      connected: () => true
    }
    actions = {
      actionClick: jest.fn(),
      actionInput: jest.fn()
    }
    store = new Vuex.Store({
      state: {},
      actions,
      getters
    })
  })

  it(`has the expected html structure`, async () => {
    wrapper = shallowMount(TmPage, { store, localVue })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show links to other pages`, () => {
    wrapper = shallowMount(TmPage, {
      store,
      localVue,
      propsData: {
        dataset: [1, 2, 3],
      },
      mocks: {
        $route: {
          name: `r1`
        }
      },
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
