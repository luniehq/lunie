import parametersModule from "src/vuex/modules/governance/parameters.js"
import lcdClientMock from "src/connectors/lcdClientMock.js"
const { governanceParameters } = lcdClientMock.state

const mockRootState = {
  connection: {
    connected: true
  }
}

describe(`Module: Governance Parameters`, () => {
  let module, node

  beforeEach(() => {
    node = {
      getGovDepositParameters: () =>
        Promise.resolve(governanceParameters.deposit),
      getGovTallyingParameters: () =>
        Promise.resolve(governanceParameters.tallying),
      getGovVotingParameters: () => Promise.resolve(governanceParameters.voting)
    }
    module = parametersModule({
      node
    })
  })

  it(`adds parameters to state`, () => {
    const { mutations, state } = module
    mutations.setGovParameters(state, governanceParameters)
    expect(state.parameters).toEqual(governanceParameters)
  })

  it(`fetches all governance parameters`, async () => {
    const { actions, state } = module
    const commit = jest.fn()
    await actions.getGovParameters({ state, commit, rootState: mockRootState })
    expect(commit.mock.calls).toEqual([
      [`setGovParameters`, governanceParameters]
    ])
  })

  it(`fetches all governance parameters on sign in`, async () => {
    const { actions } = module
    const dispatch = jest.fn()
    await actions.signIn({ dispatch })
    expect(dispatch).toHaveBeenCalledWith(`getGovParameters`)
  })

  it(`should store an error if failed to load governance deposit parameters`, async () => {
    node.getGovDepositParameters = () => Promise.reject(new Error(`Error`))
    const { actions, state } = module
    await actions.getGovParameters({
      state,
      commit: jest.fn(),
      rootState: mockRootState
    })
    expect(state.error.message).toBe(`Error`)
  })

  it(`should store an error if failed to load governance tally parameters`, async () => {
    node.getGovTallyingParameters = () => Promise.reject(new Error(`Error`))
    const { actions, state } = module
    await actions.getGovParameters({
      state,
      commit: jest.fn(),
      rootState: mockRootState
    })
    expect(state.error.message).toBe(`Error`)
  })

  it(`should store an error if failed to load governance voting parameters`, async () => {
    node.getGovVotingParameters = () => Promise.reject(new Error(`Error`))
    const { actions, state } = module
    await actions.getGovParameters({
      state,
      commit: jest.fn(),
      rootState: mockRootState
    })
    expect(state.error.message).toBe(`Error`)
  })
})
