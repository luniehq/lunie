import networks from "src/vuex/modules/networks.js"

describe(`Module: Networks`, () => {
  const mockNetworks = [
    {
      chain_id: "cosmoshub-2",
      logo_url: "https://s3.amazonaws.com/network.logos/cosmos-logo.png",
      testnet: false,
      title: "Cosmos Hub"
    },
    {
      chain_id: "gaia-13006",
      logo_url: "https://s3.amazonaws.com/network.logos/cosmos-logo.png",
      testnet: true,
      title: "Cosmos Hub"
    }
  ]
  const mockCapabilities = {
    action_delegate: true,
    action_deposit: true,
    action_proposal: true,
    action_redelegate: true,
    action_send: true,
    action_undelegate: true,
    action_vote: true,
    action_withdraw: true,
    api_url: "https://stargate.lunie.io",
    bech32_prefix: "cosmos",
    chain_id: "cosmoshub-2",
    feature_activity: true,
    feature_blocks: true,
    feature_portfolio: true,
    feature_proposals: true,
    feature_sessions: true,
    feature_validators: true,
    logo_url: "https://s3.amazonaws.com/network.logos/cosmos-logo.png",
    rpc_url: "https://stargate.lunie.io:26657",
    testnet: false,
    title: "Cosmos Hub"
  }

  it("should set networks", () => {
    const { state, mutations } = networks({})
    mutations.setNetworks(state, mockNetworks)
    expect(state.networks).toEqual(mockNetworks)
  })

  it("should set the current networks capabilities", () => {
    const { state, mutations } = networks({})
    mutations.setNetwork(state, mockCapabilities)
    expect(state.network).toEqual(mockCapabilities)
  })

  it("should load all networks on startup", async () => {
    const { actions } = networks({})
    const dispatch = jest.fn()
    await actions.init({ dispatch })
    expect(dispatch).toHaveBeenCalledWith("loadNetworks")
  })

  it("should load all networks", async () => {
    const apollo = {
      query: () => ({
        data: {
          networks: mockNetworks
        }
      })
    }
    const { state, actions } = networks({
      apollo
    })

    const commit = jest.fn()
    await actions.loadNetworks({ state, commit })
    expect(commit).toHaveBeenCalledWith("setNetworks", mockNetworks)
  })

  it("should load a networks capabilities", async () => {
    const apollo = {
      query: () => ({
        data: {
          networks: [mockCapabilities]
        }
      })
    }
    const { state, actions } = networks({
      apollo
    })

    const commit = jest.fn()
    await actions.loadNetwork({ state, commit }, "cosmoshub")
    expect(commit).toHaveBeenCalledWith("setNetwork", mockCapabilities)
  })
})
