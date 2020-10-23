import { shallowMount } from "@vue/test-utils"
import AccountMenu from "src/components/account/AccountMenu"

describe(`AccountMenu`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(AccountMenu, {
      propsData: {
        account: {
          address: `cosmos1234`,
          networkId: `cosmos-hub-mainnet`,
          sessionType: `local`,
        },
      },
      stubs: [`router-link`],
    })
  })

  it(`should show the AccountMenu page`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
