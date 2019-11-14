import PagePortfolio from "wallet/PagePortfolio"
import { shallowMount } from "@vue/test-utils"

describe(`PagePortfolio`, () => {
  let wrapper

  it("should display the portfolio page", async () => {
    wrapper = shallowMount(PagePortfolio)
    expect(wrapper.element).toMatchSnapshot()
  })
})
