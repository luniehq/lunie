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
    $store = {
      dispatch: jest.fn(),
      getters: {
        network: `cosmoshub`
      }
    }
    wrapper = shallowMount(NetworkList, {
      localVue,
      propsData: {
        networks,
        sectionTitle: `section title`
      },
      mocks: {
        $store,
        $route: {
          name: `some-random-route`
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

  it(`should return an empty string if the route is not a select-network modal`, () => {
    expect(wrapper.vm.whichFlow).toBe("")
  })

  it(`returns the create route as a string if part of the create flow`, () => {
    wrapper.setData({ $route: { name: `select-network-create` } })
    expect(wrapper.vm.whichFlow).toBe("/create")
  })

  it(`returns the recover route as a string if part of the recover flow`, () => {
    wrapper.setData({ $route: { name: `select-network-recover` } })
    expect(wrapper.vm.whichFlow).toBe("/recover")
  })

  it(`sets the network the user selects`, async () => {
    await wrapper.vm.selectNetworkHandler({ id: `emilys-chain` })
    expect($store.dispatch).toHaveBeenCalledWith(`setNetwork`, {
      id: `emilys-chain`
    })
  })

  it(`does not change network when the network is already selected`, async () => {
    console.log(wrapper.vm.$store.getters.networkId)
    await wrapper.vm.selectNetworkHandler({ id: `cosmoshub` })
    expect($store.dispatch).not.toHaveBeenCalled()
  })

  it(`does not change routes on the networks page`, async () => {
    wrapper.setData({ $route: { name: `networks` } })
    await wrapper.vm.selectNetworkHandler({ id: `emilys-chain` })
    expect(wrapper.vm.$router.push).not.toHaveBeenCalled()
  })
})
