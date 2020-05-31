import { shallowMount } from "@vue/test-utils"
import TmSelectNetwork from "common/TmSelectNetwork"

describe(`TmSelectNetwork`, () => {
  let wrapper, $store

  const networks = [
    {
      id: `awesomenet`,
      testnet: true,
      default: false,
    },
    {
      id: `keine-ahnungnet`,
      testnet: true,
      default: false,
    },
    {
      id: `la-red-feliz`,
      testnet: false,
      default: true,
    },
    {
      id: `localnet`,
      testnet: true,
      default: false,
    },
    {
      id: `emilys-chain`,
      testnet: false,
      default: false,
    },
  ]

  beforeEach(async () => {
    $store = {
      dispatch: jest.fn(),
      getters: {
        network: `localnet`,
        networks,
      },
    }
    wrapper = shallowMount(TmSelectNetwork, {
      mocks: {
        $router: {
          push: jest.fn(),
        },
        $route: {
          params: {},
        },
        $store,
      },
    })
    self.networkId = `localnet`
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
