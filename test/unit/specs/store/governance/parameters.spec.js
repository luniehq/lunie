import parametersModule from "src/vuex/modules/governance/parameters.js"
import mockValues from "test/unit/helpers/mockValues.js"
const { governanceParameters } = mockValues.state

const mockRootState = {
  connection: {
    connected: true
  }
}

describe(`Module: Governance Parameters`, () => {
  let module, node

  beforeEach(() => {
    node = {
      get: {
        govDepositParameters: () =>
          Promise.resolve(governanceParameters.deposit),
        govTallyingParameters: () =>
          Promise.resolve(governanceParameters.tallying),
        govVotingParameters: () => Promise.resolve(governanceParameters.voting)
      }
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
    node.get.govDepositParameters = () => Promise.reject(new Error(`Error`))
    const { actions, state } = module
    await actions.getGovParameters({
      state,
      commit: jest.fn(),
      rootState: mockRootState
    })
    expect(state.error.message).toBe(`Error`)
  })

  it(`should store an error if failed to load governance tally parameters`, async () => {
    node.get.govTallyingParameters = () => Promise.reject(new Error(`Error`))
    const { actions, state } = module
    await actions.getGovParameters({
      state,
      commit: jest.fn(),
      rootState: mockRootState
    })
    expect(state.error.message).toBe(`Error`)
  })

  it(`should store an error if failed to load governance voting parameters`, async () => {
    node.get.govVotingParameters = () => Promise.reject(new Error(`Error`))
    const { actions, state } = module
    await actions.getGovParameters({
      state,
      commit: jest.fn(),
      rootState: mockRootState
    })
    expect(state.error.message).toBe(`Error`)
  })
})
