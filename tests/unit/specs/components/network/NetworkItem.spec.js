// import { shallowMount, createLocalVue } from "@vue/test-utils"
import NetworkItem from "network/NetworkItem"

// const localVue = createLocalVue()

describe(`NetworkItem`, () => {
  //   let wrapper, $store

  const networkitem = {
    id: "cosmoshub",
    powered: {
      name: "Provider",
      providerAddress: "cosmosvaloper1",
      picture: ""
    }
  }

  beforeEach(() => {
    // $store = {
    //   getters: {
    //     network: `cosmoshub`,
    //     connected: ""
    //   }
    // }
    // wrapper = shallowMount(NetworkItem, {
    //   localVue,
    //   propsData: {
    //     networkitem,
    //     enabled: true
    //   },
    //   mocks: {
    //     $store,
    //     $router: {
    //       push: jest.fn()
    //     }
    //   }
    // })
  })

  it(`returns true if the network in NetworkItem is the same than the network we are connected to`, () => {
    const self = {
      network: `cosmoshub`,
      networkitem
    }
    const currentNetworkCheck = NetworkItem.computed.isCurrentNetwork.call(self)
    expect(currentNetworkCheck).toBe(true)
  })
})
