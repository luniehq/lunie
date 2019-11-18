import { shallowMount, createLocalVue } from "@vue/test-utils"
import NetworkList from "network/NetworkList"

const localVue = createLocalVue()

describe(`NetworkList`, () => {
  let wrapper

  const networks = [
    {
      id: "gaia-testnet",
      chain_id: "gaia-123",
      logo_url: "cosmos-logo.png",
      testnet: true,
      title: "Cosmos Hub Test"
    },
    {
      id: "cosmoshub",
      chain_id: "cosmoshub",
      logo_url: "cosmos-logo.png",
      testnet: false,
      title: "Cosmos Hub"
    }
  ]

  beforeEach(() => {
    wrapper = shallowMount(NetworkList, {
      localVue,
      propsData: {
        networks
      },
      mocks: {
        $store: {
          dispatch: jest.fn(),
          state: {
            connection: {
              network: `cosmoshub`
            },
            session: {
              signedIn: false
            }
          }
        },
        $route: {
          params: { height: `100` }
        },
        $router: {
          push: jest.fn()
        }
      },
      stubs: [`router-link`]
    })
  })

  it(`shows a list of networks`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it("sets new network when clicking list item", () => {
    wrapper.find(".select-network-item:not(.selected)").trigger("click")
    expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith(`setNetwork`, {
      id: "gaia-testnet",
      chain_id: "gaia-123",
      logo_url: "cosmos-logo.png",
      testnet: true,
      title: "Cosmos Hub Test"
    })
  })

  it("does not change network when already selected", () => {
    wrapper.find(".select-network-item.selected").trigger("click")
    expect(wrapper.vm.$store.dispatch).not.toHaveBeenCalledWith()
  })

  it(`shows windows about switching networks`, async () => {
    wrapper.setData({
      session: {
        signedIn: true,
        windowsDevice: true
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
