import { mount, createLocalVue } from "@vue/test-utils"
import PageFeatureNotAvailable from "common/PageFeatureNotAvailable"
import Vuex from "vuex"
const localVue = createLocalVue()

localVue.use(Vuex)

describe(`PageFeatureNotAvailable`, () => {
  let wrapper
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        session: () => ({ address: `cosmos`, atoms: 1 }),
      },
      getters: {
        connected: () => true,
      }
    })
    wrapper = mount(PageFeatureNotAvailable, {
      store,
      localVue,
      propsData: {
        feature: "spacetravel",
      },
      stubs: [`router-link`]
    })
  })

  it(`shows a warning about a feature not being available`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
