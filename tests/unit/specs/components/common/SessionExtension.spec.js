import { shallowMount } from "@vue/test-utils"
import TmSessionExtension from "common/TmSessionExtension"

describe(`SessionExtension`, () => {
  let wrapper, $store, $router

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
      getters: {
        networkSlug: "cosmos-hub"
      },
      commit: jest.fn(),
      dispatch: jest.fn(),
      state
    }
    $router = {
      push: jest.fn()
    }
    wrapper = shallowMount(TmSessionExtension, {
      mocks: {
        $store,
        $router
      }
    })

    wrapper.setData({
      networks: [
        {
          id: "cosmos-hub-mainnet",
          slug: "cosmos-hub"
        }
      ]
    })
  })

  it("should sign in with the selected account", async () => {
    await wrapper.vm.signInAndRedirect({
      network: "cosmos-hub-mainnet",
      address: "cosmos1"
    })

    expect($router.push).toHaveBeenCalledWith({
      name: "portfolio",
      params: { networkId: "cosmos-hub" }
    })
    expect($store.dispatch).toHaveBeenCalledWith("signIn", {
      sessionType: `extension`,
      address: "cosmos1",
      networkId: "cosmos-hub-mainnet"
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
