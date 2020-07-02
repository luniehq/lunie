import { shallowMount } from "@vue/test-utils"
import AccountMenu from "src/components/account/AccountMenu"

describe(`AccountMenu`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(AccountMenu, {
      props: {
        address: `cosmos1234`,
      },
      stubs: [`router-link`],
    })
  })

  it(`should show the AccountMenu page`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
