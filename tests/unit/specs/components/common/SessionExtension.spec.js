import { shallowMount } from "@vue/test-utils"
import TmSessionExtension from "common/TmSessionExtension"

describe(`SessionExtension`, () => {
  let wrapper, $store

  const accounts = [
    {
      address: "cosmos1234",
      name: "TEST_WALLET"
    },
    {
      address: "cosmos15678",
      name: "TEST_WALLET_2"
    }
  ]

  beforeEach(() => {
    const state = {
      extension: {
        enabled: true,
        accounts
      }
    }

    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      state
    }
    wrapper = shallowMount(TmSessionExtension, {
      mocks: {
        $store,
        $router: {
          push: jest.fn()
        },
        $route: {
          name: `r1`,
          params: {
            address: `cosmos1234`,
            network: `cosmos-hub-mainnet`
          }
        }
      }
    })
  })

  it(`should show a list of all accounts in the extension`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should show a guide to install the extension if no extension is installed`, () => {
    wrapper.vm.extension.enabled = false
    expect(wrapper.element).toMatchSnapshot()
  })

  it("should load addresses on mount", () => {
    expect($store.dispatch).toHaveBeenCalledWith("getAddressesFromExtension")
  })
})
