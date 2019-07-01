import { shallowMount } from "@vue/test-utils"
import TmSessionExtension from "common/TmSessionExtension"

describe(`SessionApprove`, () => {
  let wrapper, $store

  beforeEach(() => {
    const getters = {
      session: {
        extensionInstalled: true
      },
      extension: {
        wallets: [
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
        $store
      }
    })
  })

  it(`shows an overview of all wallets to sign in with from the extension`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows a guide to install the extension if no extension installed`, () => {
    wrapper.vm.session.extensionInstalled = false
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
    expect(wrapper.vm.$emit).toHaveBeenCalledWith("close")
  })

  it(`should set the current view to the state`, () => {
    const self = {
      $emit: jest.fn()
    }
    TmSessionExtension.methods.setState.call(self, `someState`)
    expect(self.$emit).toHaveBeenCalledWith(`route-change`, `someState`)
  })

  it(`should go back to the existing account screen`, () => {
    const self = {
      $emit: jest.fn()
    }
    TmSessionExtension.methods.goBack.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`route-change`, `existing`)
  })
})
