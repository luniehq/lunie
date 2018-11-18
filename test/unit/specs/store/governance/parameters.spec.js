import parametersModule from "renderer/vuex/modules/governance/parameters.js"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
let { govParameters } = lcdClientMock.state

describe(`Module: Governance Parameters`, () => {
  let module

  beforeEach(() => {
    module = parametersModule({
      node: {
        getGovDepositParameters: () => Promise.resolve(govParameters.deposit),
        getGovTallyingParameters: () => Promise.resolve(govParameters.tallying),
        getGovVotingParameters: () => Promise.resolve(govParameters.voting)
      }
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
    await actions.getGovParameters({ state, commit })
    expect(commit.mock.calls).toEqual([[`setGovParameters`, govParameters]])
  })
})
