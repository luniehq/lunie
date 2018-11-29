import parametersModule from "renderer/vuex/modules/governance/parameters.js"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
let { govParameters } = lcdClientMock.state

let mockRootState = {
  connection: {
    connected: true
  }
}

describe(`Module: Governance Parameters`, () => {
  let module, node

  beforeEach(() => {
    node = {
      getGovDepositParameters: () => Promise.resolve(govParameters.deposit),
      getGovTallyingParameters: () => Promise.resolve(govParameters.tallying),
      getGovVotingParameters: () => Promise.resolve(govParameters.voting)
    }
    module = parametersModule({
      node
    })
  })

  it(`adds parameters to state`, () => {
    let { mutations, state } = module
    mutations.setGovParameters(state, govParameters)
    expect(state.govParameters).toEqual(govParameters)
  })

  it(`fetches all governance parameters`, async () => {
    let { actions, state } = module
    let commit = jest.fn()
    await actions.getGovParameters({ state, commit, rootState: mockRootState })
    expect(commit.mock.calls).toEqual([[`setGovParameters`, govParameters]])
  })

  it(`should store an error if failed to load governance deposit parameters`, async () => {
    node.getGovDepositParameters = () => Promise.reject(new Error(`Error`))
    let { actions, state } = module
    await actions.getGovParameters({
      state,
      commit: jest.fn()
    })
    expect(state.error.message).toBe(`Error`)
  })

  it(`should store an error if failed to load governance tally parameters`, async () => {
    node.getGovTallyingParameters = () => Promise.reject(new Error(`Error`))
    let { actions, state } = module
    await actions.getGovParameters({
      state,
      commit: jest.fn()
    })
    expect(state.error.message).toBe(`Error`)
  })

  it(`should store an error if failed to load governance voting parameters`, async () => {
    node.getGovVotingParameters = () => Promise.reject(new Error(`Error`))
    let { actions, state } = module
    await actions.getGovParameters({
      state,
      commit: jest.fn()
    })
    expect(state.error.message).toBe(`Error`)
  })
})
