import { shallowMount } from "@vue/test-utils"
import TmSessionExtension from "common/TmSessionExtension"

describe(`SessionExtension`, () => {
  let wrapper, $store

  beforeEach(() => {
    const state = {
      extension: {
        enabled: true,
        accounts: [
          {
            address: "cosmos1234",
            name: "TEST_WALLET"
          },
          {
            address: "cosmos15678",
            name: "TEST_WALLET_2"
          }
        ]
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
        }
      }
    })
  })

  it(`should show a list of all accounts in the extension`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show a guide to install the extension if no extension is installed`, () => {
    wrapper.vm.extension.enabled = false
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should load addresses on mount", () => {
    expect($store.dispatch).toHaveBeenCalledWith("getAddressesFromExtension")
  })

  it("should trigger sign in call and route the user to the homepage", () => {
    wrapper.vm.signIn(`cosmosaddress123`)
    expect($store.dispatch).toHaveBeenCalledWith("signIn", {
      sessionType: `extension`,
      address: "cosmosaddress123"
    })
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/portfolio`)
  })
})
