import distributionModule from "modules/distribution.js"

describe(`Module: Fee Distribution`, () => {
  let module, state, mutations, rewards

  beforeEach(() => {
    module = distributionModule({ node: {} })
    state = module.state
    mutations = module.mutations

    rewards = {
        stake: 100,
        photinos: 15
    }
  })

  describe(`Mutations`, () => {
    it(`sets the total delegator rewards earned from all delegations`, async () => {
        mutations.setTotalRewards(state, rewards)
        expect(state.totalRewards).toMatchObject(rewards)
    })

    it(`sets the delegation rewards from a `, () => {
        const validatorAddr = `cosmosvalopr1address`
        mutations.setDelegationRewards(state, {validatorAddr, rewards })
        expect(state.rewards[validatorAddr]).toBe(rewards)
    })

    it(`sets the account public key`, () => {
        const parameters = {
            base_proposer_reward: `10.00`,
            bonus_proposer_reward: `3.5`,
            community_tax: `15`
        }
        mutations.setDistributionParameters(state, parameters)
        expect(state.parameters).toMatchObject(parameters)
    })

    it(`updates the state if the device is connected`, () => {
      mutations.setOutstandingRewards(state, rewards)
      expect(state.outstandingRewards).toMatchObject(rewards)
    })

    it(`sets an error`, () => {
      const error = Error(`distribution error`)
      mutations.setDistributionError(state, error)
      expect(state.error).toBe(error)
    })
  })

  describe(`Actions`, () => {})
})
