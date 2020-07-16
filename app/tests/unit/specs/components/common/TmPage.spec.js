import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmPage from "src/components/common/TmPage"
import Vuex from "vuex"
const localVue = createLocalVue()

localVue.use(Vuex)

describe(`TmPage`, () => {
  let wrapper
  let store
  let getters

  beforeEach(() => {
    getters = {
      connected: () => true,
    }
    store = new Vuex.Store({
      state: {
        session: () => ({ address: `cosmos`, atoms: 1 }),
      },
      getters,
    })
  })

  it(`shows a page skeleton`, async () => {
    wrapper = shallowMount(TmPage, { store, localVue, stubs: [`router-link`] })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should show links to other pages`, () => {
    wrapper = shallowMount(TmPage, {
      store,
      localVue,
      propsData: {
        dataEmpty: true,
      },
      mocks: {
        $route: {
          name: `r1`,
        },
      },
      stubs: [`router-link`],
    })

    expect(wrapper.element).toMatchSnapshot()
  })
})
