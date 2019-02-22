import { shallowMount } from "@vue/test-utils"
import PageStaking from "renderer/components/staking/PageStaking"

describe(`PageStaking`, () => {
  let wrapper, $store

  const getters = {
  }

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters
    }

   wrapper = shallowMount(PageStaking, {
      mocks: {
        $store
      },
      stubs: [`router-view`]
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
