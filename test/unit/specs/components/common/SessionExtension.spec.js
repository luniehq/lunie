import { shallowMount } from "@vue/test-utils"
import TmSessionExtension from "common/TmSessionExtension"

describe(`SessionExtension`, () => {
  let wrapper, $store

  beforeEach(() => {
    const getters = {
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
      getters
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

  it(`shows an overview of all wallets to sign in with from the extension`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows a guide to install the extension if no extension installed`, () => {
    wrapper.vm.extension.enabled = false
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("loads addresses on mount", () => {
    expect($store.dispatch).toHaveBeenCalledWith("getAddressesFromExtension")
  })

  it("triggers sign in", () => {
    wrapper.find(".extension-address-item tmbtn-stub").trigger("click")
    expect($store.dispatch).toHaveBeenCalledWith("signIn", {
      sessionType: `extension`,
      address: "cosmos1234"
    })
  })

  it("closes session after sign in", () => {
    wrapper.vm.$emit = jest.fn()
    wrapper.find(".extension-address-item tmbtn-stub").trigger("click")
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/`)
  })
})
