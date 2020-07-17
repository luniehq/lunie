import { shallowMount } from "@vue/test-utils"
import PageFeatureNotAvailable from "common/PageFeatureNotAvailable"

describe(`PageFeatureNotAvailable`, () => {
  let wrapper, $store

  beforeEach(() => {
    const state = {
      session: {
        address: `cosmos`,
        atoms: 1,
      },
    }
    $store = {
      state,
      getters: {
        connected: true,
      },
    }
    wrapper = shallowMount(PageFeatureNotAvailable, {
      mocks: {
        $store,
      },
      propsData: {
        feature: "spacetravel",
      },
    })
  })

  it(`shows a warning about a feature not being available`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
