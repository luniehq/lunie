import { shallowMount } from "@vue/test-utils"
import TmSelectNetwork from "common/TmSelectNetwork"

describe(`TmSelectNetwork`, () => {
  let wrapper, $store

  const networks = [
    {
      id: `awesomenet`,
      testnet: true,
      default: false
    },
    {
      id: `keine-ahnungnet`,
      testnet: true,
      default: false
    },
    {
      id: `la-red-feliz`,
      testnet: false,
      default: true
    },
    {
      id: `localnet`,
      testnet: true,
      default: false
    },
    {
      id: `emilys-chain`,
      testnet: false,
      default: false
    }
  ]

  beforeEach(async () => {
    $store = {
      dispatch: jest.fn(),
      getters: {
        network: `localnet`,
        networks
      }
    }
    wrapper = shallowMount(TmSelectNetwork, {
      mocks: {
        $router: {
          push: jest.fn()
        },
        $route: {
          params: {}
        },
        $store
      }
    })
    self.networkId = `localnet`
    wrapper.setData({
      // network id is not set there
      sortedNetworks: TmSelectNetwork.methods.updateSelectedNetwork.call(
        self,
        networks
      )
    })
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`returns the networks sorted by the following criteria: current first, then default then mainnets, then testnets`, () => {
    expect(wrapper.vm.sortedNetworks).toEqual([
      { default: false, id: "localnet", testnet: true },
      { default: true, id: "la-red-feliz", testnet: false },
      { default: false, id: "emilys-chain", testnet: false },
      { default: false, id: "awesomenet", testnet: true },
      { default: false, id: "keine-ahnungnet", testnet: true }
    ])
  })

  it(`works in the extension where there is no current network`, () => {
    wrapper.vm.$store.getters.network = undefined
    expect(wrapper.vm.sortedNetworks).toEqual([
      { default: false, id: "localnet", testnet: true },
      { default: true, id: "la-red-feliz", testnet: false },
      { default: false, id: "emilys-chain", testnet: false },
      { default: false, id: "awesomenet", testnet: true },
      { default: false, id: "keine-ahnungnet", testnet: true }
    ])
  })

  it(`sets the network the user selects`, async () => {
    await wrapper.vm.selectNetworkHandler({ id: "emilys-chain" })
    expect($store.dispatch).toHaveBeenCalledWith(`setNetwork`, {
      id: "emilys-chain"
    })
  })

  it(`switches the next route based on a parameter`, async () => {
    expect(wrapper.vm.whichFlow).toBe("/create")

    wrapper.setData({ $route: { params: { recover: true } } })
    expect(wrapper.vm.whichFlow).toBe("/recover")
  })
})
