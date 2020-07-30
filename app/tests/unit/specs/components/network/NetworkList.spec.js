import { shallowMount, createLocalVue } from "@vue/test-utils"
import NetworkList from "network/NetworkList"

const localVue = createLocalVue()

describe(`NetworkList`, () => {
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
        network: `cosmoshub`,
      },
    }
    wrapper = shallowMount(NetworkList, {
      localVue,
      propsData: {
        networks,
        sectionTitle: `section title`,
      },
      mocks: {
        $store,
        $route: {
          name: `some-random-route`,
        },
        $router: {
          push: jest.fn(),
        },
      },
      stubs: [`router-link`],
    })
  })

  it(`shows a list of networks`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
