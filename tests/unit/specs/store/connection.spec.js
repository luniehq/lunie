import connectionModule from "src/vuex/modules/connection.js"

jest.mock(`src/../config.js`, () => ({
  stargate: `https://voyager.lol`
}))

describe(`Module: Connection`, () => {
  let module, state, actions, mutations

  beforeEach(() => {
    module = connectionModule({})
    state = module.state
    actions = module.actions
    mutations = module.mutations
  })

  describe(`mutations`, () => {
    it(`sets nodeUrl from config.json`, () => {
      expect(state.nodeUrl).toBe(`https://voyager.lol`)
    })

    it(`setNetworkId`, () => {
      state.network = ""
      mutations.setNetworkId(state, "awesomenet")
      expect(state.network).toBe("awesomenet")
    })
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
