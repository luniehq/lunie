import connectionModule from "src/vuex/modules/connection.js"

jest.mock(`src/../config.js`, () => ({
  stargate: `https://voyager.lol`,
  network: `keine-ahnungnet`,
}))

describe(`Module: Connection`, () => {
  let module, state, actions, mutations

  const networks = [
    { id: `awesomenet`, slug: `awesome` },
    { id: `keine-ahnungnet`, slug: `ahnungnet` },
    { id: `localnet`, slug: `local` },
  ]

  let mockApollo = {
    async query() {
      return {
        data: {
          networks,
        },
      }
    },
  }

  beforeEach(() => {
    module = connectionModule({ apollo: mockApollo })
    state = module.state
    state.networks = networks
    actions = module.actions
    mutations = module.mutations
  })

  describe(`mutations`, () => {
    it(`setNetworkId`, () => {
      state.network = ""
      mutations.setNetworkId(state, "awesomenet")
      expect(state.network).toBe("awesomenet")
    })

    it(`sets the type of an address`, () => {
      state = {}
      let addressType = `polkadot`
      mutations.setAddressType(state, addressType)
      expect(state.addressType).toEqual(`polkadot`)
    })
  })

  it("should persist the network", async () => {
    const network = {
      id: `awesomenet`,
    }
    await actions.persistNetwork({}, network)
    expect(localStorage.getItem(`network`)).toEqual(
      JSON.stringify(`awesomenet`)
    )
  })

  it(`assigns the user a network if a network was found`, async () => {
    const commit = jest.fn()
    const dispatch = jest.fn()
    localStorage.setItem(
      JSON.stringify({
        network: `awesomenet`,
      })
    )
    await actions.checkForPersistedNetwork({ dispatch, commit })
    expect(dispatch).toHaveBeenCalledWith(`setNetwork`, {
      id: `awesomenet`,
      slug: `awesome`,
    })
    localStorage.clear()
  })

  it(`assigns the user the default network if there is no persisted network 
  and the default network is among the available networks`, async () => {
    const dispatch = jest.fn()
    const commit = jest.fn()
    await actions.checkForPersistedNetwork({ dispatch, commit })
    expect(dispatch).toHaveBeenCalledWith(`setNetwork`, {
      id: `keine-ahnungnet`,
      slug: `ahnungnet`,
    })
    localStorage.clear()
  })

  it(`assigns the user the fallback network if there is no persisted network 
  and the default network is not among the available networks`, async () => {
    const dispatch = jest.fn()
    const commit = jest.fn()
    state.externals = {
      config: {
        stargate: `https://voyager.lol`,
        network: `strangenet`,
      },
    }
    state.networks = [networks[2]]
    await actions.checkForPersistedNetwork({ dispatch, commit })
    expect(dispatch).toHaveBeenCalledWith(`setNetwork`, {
      id: `localnet`,
      slug: `local`,
    })
  })

  it("should switch networks", async () => {
    const dispatch = jest.fn()
    const commit = jest.fn()
    await actions.setNetwork(
      { commit, dispatch },
      {
        id: "awesomenet",
      }
    )
    expect(commit).toHaveBeenCalledWith("setNetworkId", "awesomenet")
  })

  describe("getNetworkByAccount", () => {
    const state = {
      networks: [
        {
          id: "kusama",
          slug: "kusama",
          network_type: "polkadot",
          address_prefix: "2",
        },
        {
          id: "cosmos-hub-mainnet",
          slug: "cosmos-hub",
          address_prefix: "cosmos",
          network_type: "cosmos",
          testnet: false,
        },
        {
          id: "cosmos-hub-testnet",
          slug: "cosmos-hub-testnet",
          address_prefix: "cosmos",
          network_type: "cosmos",
          testnet: true,
        },
        {
          id: "terra-testnet",
          slug: "terra-testnet",
          address_prefix: "terra",
          network_type: "cosmos",
          testnet: true,
        },
      ],
    }

    it(`identifies a Cosmos address`, async () => {
      const address = `cosmos19fpzpl5s3nctstne4rqqcd6mt0dn9a0svkvkaa`
      const network = await actions.getNetworkByAccount(
        { state },
        { account: { address } }
      )
      expect(network.id).toBe("cosmos-hub-mainnet")
    })

    it(`identifies a testnet Cosmos address`, async () => {
      const address = `cosmos19fpzpl5s3nctstne4rqqcd6mt0dn9a0svkvkaa`
      const network = await actions.getNetworkByAccount(
        { state },
        { account: { address }, testnet: true }
      )
      expect(network.id).toBe("cosmos-hub-testnet")
    })

    it(`identifies a Polkadot Kusama address`, async () => {
      const polkadotAddress = `EksmaF7D2fWWjcX9LvZ48g9j1y4TpexY2ixNraHTfMWRton`
      const network = await actions.getNetworkByAccount(
        { state },
        { account: { address: polkadotAddress }, testnet: true }
      )
      expect(network).toBeDefined()
    })

    it(`should show error if address is not in bech32`, () => {
      const address = `cosmosxxxxx`
      expect(
        actions.getNetworkByAccount({ state }, { account: { address } })
      ).rejects.toThrow()
    })

    it(`should show error if address is a validator address`, () => {
      const address = `cosmosvaloper12knqu4ecmg0982plzs9m9f5jareh0cvegcw3wu`
      expect(
        actions.getNetworkByAccount({ state }, { account: { address } })
      ).rejects.toThrow()
    })

    it(`should show error if address is a "cosmospub" address`, () => {
      const address = `cosmospub1addwnpepqgadvwk7ev0kk2x0tua0hrt056p8tqpv35r0mwydz45ytxp3wfaz5e7nxun`
      expect(
        actions.getNetworkByAccount({ state }, { account: { address } })
      ).rejects.toThrow()
    })

    it(`filters networks correctly also on prefix`, async () => {
      const address = `terra1mma85hevm6kavfuu9mgmektxvmxnwssqspxrhc`
      const network = await actions.getNetworkByAccount(
        { state },
        { account: { address }, testnet: true }
      )
      expect(network.id).toBe("terra-testnet")
    })
  })
})
