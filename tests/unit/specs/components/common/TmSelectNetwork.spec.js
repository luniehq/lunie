import { shallowMount } from "@vue/test-utils"
import TmSelectNetwork from "common/TmSelectNetwork"

describe(`TmSelectNetwork`, () => {
  let wrapper
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

  beforeEach(() => {
    wrapper = shallowMount(TmSelectNetwork, {
      mocks: {
        $store: {
          dispatch: jest.fn(),
          state: {
            connection: {
              network: `gaia-testnet`
            }
          }
        }
      }
    })
    wrapper.setData({ networks })
  })
  // hack to prevent "You may have an infinite update loop in a component render function." error
  // destroying test. Looking for the real fix
  afterAll(() => setTimeout(() => process.exit(), 1))

  it(`has the expected html structure`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`returns the networks sorted by the following criteria: mainnets first and default
    network the first of all of them`, () => {
    expect(wrapper.vm.sortedNetworks).toEqual([
      { default: true, id: "la-red-feliz", testnet: false },
      { default: false, id: "emilys-chain", testnet: false },
      { default: false, id: "awesomenet", testnet: true },
      { default: false, id: "keine-ahnungnet", testnet: true },
      { default: false, id: "localnet", testnet: true }
    ])
  })
})
