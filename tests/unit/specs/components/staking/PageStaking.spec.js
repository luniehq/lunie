import { shallowMount } from "@vue/test-utils"
import PageStaking from "src/components/staking/PageStaking"

describe(`PageStaking`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(PageStaking, {
      mocks: {
        $store: {}
      },
      stubs: [`router-view`]
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
