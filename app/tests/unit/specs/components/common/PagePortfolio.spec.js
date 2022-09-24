import PagePortfolio from "common/PagePortfolio"
import { shallowMount } from "@vue/test-utils"

describe(`PagePortfolio`, () => {
  let wrapper, $store

  const state = {
    session: { experimentalMode: false },
  }

  beforeEach(() => {
    $store = {
      state,
    }

    wrapper = shallowMount(PagePortfolio, {
      mocks: {
        $store,
      },
    })
  })

  it("should display the portfolio page", async () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
