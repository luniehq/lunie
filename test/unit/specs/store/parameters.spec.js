import parametersModule from "renderer/vuex/modules/parameters.js"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
let { stakingParameters } = lcdClientMock.state

describe(`Module: Staking Parameters`, () => {
  let module, node

  beforeEach(() => {
    let test = instance.shallow(null)
    store = test.store

    store.commit(`setConnected`, true)
  })

  it(`should have no parameters by default`, () => {
    expect(store.state.parameters.parameters).toEqual({})
    node = {
      getStakingParameters: () => Promise.resolve(stakingParameters)
    }
    module = parametersModule({ node })
  })

  it(`should fetch staking parameters`, async () => {
    let { actions, state } = module
    let commit = jest.fn()
    await actions.getStakingParameters({ state, commit })
    expect(commit.mock.calls).toEqual([
      [`setStakingParameters`, stakingParameters]
    ])
  })

  it(`should add staking parameters to state`, () => {
    let { mutations, state } = module
    mutations.setStakingParameters(state, stakingParameters)
    expect(state.parameters).toEqual(stakingParameters)
  })

  it(`should store an error if failed to load staking parameters`, async () => {
    node.getStakingParameters = () => Promise.reject(new Error(`Error`))
    let { actions, state } = module
    await actions.getStakingParameters({
      state,
      commit: jest.fn(),
      rootState: {
        connection: {
          connected: true
        }
      }
    })
    expect(state.error.message).toBe(`Error`)
  })
})
