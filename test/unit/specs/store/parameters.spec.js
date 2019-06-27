import parametersModule from "src/vuex/modules/parameters.js"
import mockValues from "test/unit/helpers/mockValues.js"
const { stakingParameters } = mockValues.state

const mockRootState = {
  connection: {
    connected: true
  }
}

describe(`Module: Staking Parameters`, () => {
  let module, node

  beforeEach(() => {
    node = {
      get: {
        stakingParameters: () => Promise.resolve(stakingParameters.parameters)
      }
    }
    module = parametersModule({ node })
  })

  it(`should fetch staking parameters`, async () => {
    const { actions, state } = module
    const commit = jest.fn()
    await actions.getStakingParameters({
      state,
      commit,
      rootState: mockRootState
    })
    expect(commit.mock.calls).toEqual([
      [`setStakingParameters`, stakingParameters.parameters]
    ])
  })

  it(`fetches all staking parameters on sign in`, async () => {
    const { actions } = module
    const dispatch = jest.fn()
    await actions.signIn({ dispatch })
    expect(dispatch).toHaveBeenCalledWith(`getStakingParameters`)
  })

  it(`should add staking parameters to state`, () => {
    const { mutations, state } = module
    mutations.setStakingParameters(state, stakingParameters.parameters)
    expect(state.parameters).toEqual(stakingParameters.parameters)
  })

  it(`should store an error if failed to load staking parameters`, async () => {
    node.get.stakingParameters = () => Promise.reject(new Error(`Error`))
    const { actions, state } = module
    await actions.getStakingParameters({
      state,
      commit: jest.fn(),
      rootState: mockRootState
    })
    expect(state.error.message).toBe(`Error`)
  })
})
