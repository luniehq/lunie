import { shallowMount } from "@vue/test-utils"
import HDPathOrCurve from "common/HDPathOrCurve"

describe(`HDPathOrCurve`, () => {
  let wrapper, $store, getters

  beforeEach(() => {
    getters = {
      currentNetwork: {
        id: "cosmos-hub-mainnet",
        network_type: "cosmos",
        address_prefix: "cosmos",
        testnet: false,
        HDPaths: `[{"value":"m/44'/118'/0'/0/0", "name":"Cosmos HD Path"}]`,
        curves: `[{"value":"ed25519", "name":"Edwards curve"}]`,
      },
    }
    $store = {
      getters,
    }
    wrapper = shallowMount(HDPathOrCurve, {
      propsData: {
        attempt: 0,
        networkCryptoTypes: [`m/44'/118'/0'/0/0`],
      },
      mocks: {
        $store,
      },
    })
  })

  // case cosmos
  it(`should return a beautiful presentation for the curve to be displayed on modal`, () => {
    expect(wrapper.vm.currentCryptoView).toEqual("Cosmos HD Path")
  })

  // case polkadot
  it(`should return a beautiful presentation for the curve to be displayed on modal`, () => {
    wrapper.setData({
      currentNetwork: {
        id: "polkadot-testnet",
        network_type: "polkadot",
        address_prefix: "42",
        testnet: false,
        HDPaths: `[""]`,
        curves: `[{"value":"sr25519", "name":"Schnorrkel curve"},{"value":"ed25519", "name":"Edwards curve"}]`,
      },
    })
    wrapper.setProps({ attempt: 1 })
    expect(wrapper.vm.currentCryptoView).toEqual("Edwards curve")
  })
})
