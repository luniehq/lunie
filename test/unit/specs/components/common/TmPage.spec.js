import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmPage from "src/components/common/TmPage"
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

  it(`shows a page skeleton`, async () => {
    wrapper = shallowMount(TmPage, { store, localVue, stubs: [`router-link`] })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show links to other pages`, () => {
    wrapper = shallowMount(TmPage, {
      store,
      localVue,
      propsData: {
        dataEmpty: true
      },
      mocks: {
        $route: {
          name: `r1`
        }
      },
      stubs: [`router-link`]
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`scrolls back to the top on a route change`, () => {
    const self = {
      scrollContainer: {
        scrollTop: 100
      }
    }
    TmPage.watch.$route.call(self)
    expect(self.scrollContainer.scrollTop).toBe(0)
  })
})
