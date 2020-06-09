import { shallowMount, createLocalVue } from "@vue/test-utils"
import PageNetworks from "network/PageNetworks"

const localVue = createLocalVue()

describe(`PageNetworks`, () => {
  let wrapper, $store

  const networks = [
    {
      id: "gaia-testnet",
      chain_id: "gaia-123",
      logo_url: "cosmos-logo.png",
      testnet: true,
      title: "Cosmos Hub Test",
    },
    {
      id: "cosmoshub",
      chain_id: "cosmoshub",
      logo_url: "cosmos-logo.png",
      testnet: false,
      title: "Cosmos Hub",
    },
  ]

  beforeEach(() => {
    $store = {
      dispatch: jest.fn(),
      getters: {
        networks,
      },
    }
    wrapper = shallowMount(PageNetworks, {
      localVue,
      mocks: {
        $store,
      },
    })
  })

  it(`shows a page with a selection of networks`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`has 2 network lists`, () => {
    expect(wrapper.findAll("networklist-stub").length).toBe(3)
  })
})
