import mintingModule from "src/vuex/modules/minting.js"

const mockRootState = {
  connection: {
    connected: true
  }
}

describe(`Module: Minting Parameters`, () => {
  let module, node

  beforeEach(() => {
    node = {
      get: {
        annualProvisionedTokens: () => Promise.resolve("100000")
      }
    }
    module = mintingModule({ node })
  })

  it(`should fetch annual provisioned tokens`, async () => {
    const { actions, state } = module
    const commit = jest.fn()
    await actions.getMintingParameters({
      state,
      commit,
      rootState: mockRootState
    })
    expect(commit.mock.calls).toEqual([[`setAnnualProvision`, 100000]])
  })
})
