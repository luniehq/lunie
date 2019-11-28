import connectionModule from "src/vuex/modules/connection.js"

jest.mock(`src/../config.js`, () => ({
  stargate: `https://voyager.lol`,
  network: `keine-ahnungnet`
}))

describe(`Module: Connection`, () => {
  let module, state, actions, mutations
  let mockApollo = {
    async query() {
      return {
        data: {
          networks: [
            { id: `awesomenet` },
            { id: `keine-ahnungnet` },
            { id: `localnet` }
          ]
        }
      }
    }
  }

  beforeEach(() => {
    module = connectionModule({ apollo: mockApollo })
    state = module.state
    actions = module.actions
    mutations = module.mutations
  })

  describe(`mutations`, () => {
    it(`setNetworkId`, () => {
      state.network = ""
      mutations.setNetworkId(state, "awesomenet")
      expect(state.network).toBe("awesomenet")
    })
  })

  it("should persist the network", async () => {
    const network = {
      id: `awesomenet`
    }
    await actions.persistNetwork({}, network)
    expect(localStorage.getItem(`network`)).toEqual(
      JSON.stringify(`awesomenet`)
    )
  })

  it(`assigns the user a network if a network was found`, async () => {
    const commit = jest.fn()
    localStorage.setItem(
      JSON.stringify({
        network: `awesomenet`
      })
    )
    await actions.checkForPersistedNetwork({ commit })
    expect(commit).toHaveBeenCalledWith(`setNetworkId`, `awesomenet`)
    localStorage.clear()
  })

  it(`assigns the user the default network if there is no persisted network 
  and the default network is among the available networks`, async () => {
    const dispatch = jest.fn()
    await actions.checkForPersistedNetwork({ dispatch })
    expect(dispatch).toHaveBeenCalledWith(`setNetwork`, {
      id: "keine-ahnungnet"
    })
    localStorage.clear()
  })

  it(`assigns the user the fallback network if there is no persisted network 
  and the default network is not among the available networks`, async () => {
    const dispatch = jest.fn()
    state.network = "strangenet"
    state.externals = {
      config: {
        stargate: `https://voyager.lol`,
        network: `strangenet`,
        fallbackNetwork: `localnet`
      }
    }
    await actions.checkForPersistedNetwork({ dispatch })
    expect(dispatch).toHaveBeenCalledWith(`setNetwork`, { id: "localnet" })
  })

  it("should switch networks", async () => {
    const dispatch = jest.fn()
    const commit = jest.fn()
    await actions.setNetwork(
      { commit, dispatch },
      {
        id: "awesomenet",
        rpc_url: "https://localhost:1337"
      }
    )
    expect(commit).toHaveBeenCalledWith("setNetworkId", "awesomenet")
  })
})
