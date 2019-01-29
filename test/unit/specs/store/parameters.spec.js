import parametersModule from "renderer/vuex/modules/parameters.js"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
const { stakingParameters } = lcdClientMock.state

const mockRootState = {
  connection: {
    connected: true
  }
}

describe(`Module: Staking Parameters`, () => {
  let module, node

  beforeEach(() => {
    node = {
      getStakingParameters: () => Promise.resolve(stakingParameters.parameters)
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

  it(`should add staking parameters to state`, () => {
    const { mutations, state } = module
    mutations.setStakingParameters(state, stakingParameters.parameters)
    expect(state.parameters).toEqual(stakingParameters.parameters)
  })

  it(`should store an error if failed to load staking parameters`, async () => {
    node.getStakingParameters = () => Promise.reject(new Error(`Error`))
    const { actions, state } = module
    await actions.getStakingParameters({
      state,
      commit: jest.fn(),
      rootState: mockRootState
    })
    expect(state.error.message).toBe(`Error`)
  })
})
