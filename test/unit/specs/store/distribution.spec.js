import distributionModule from "modules/distribution.js"

describe(`Module: Fee Distribution`, () => {
  let module, state, commit, dispatch, actions, mutations, rootState
  const coinArray = [{ denom: `stake`, amount: `100` }, { denom: `photino`, amount: `15` }]
  const parameters = {
    base_proposer_reward: `10.00`,
    bonus_proposer_reward: `3.5`,
    community_tax: `15`
  }
  const node = {
    getDelegatorRewards: jest.fn(async () => coinArray),
    postWithdrawDelegatorRewards: jest.fn(),
    getDelegatorRewardsFromValidator: jest.fn(async () => coinArray),
    postWithdrawDelegatorRewardsFromValidator: jest.fn(),
    getDistributionParameters: jest.fn(async () => parameters),
    getDistributionOutstandingRewards: jest.fn(async () => coinArray),
  }
  const rewards = {
    stake: 100,
    photino: 15
  }

  beforeEach(() => {
    module = distributionModule({ node })
    state = module.state
    actions = module.actions
    mutations = module.mutations

    commit = jest.fn()
    dispatch = jest.fn()

    rootState = {
      session: { address: `cosmos1address` },
      wallet: { address: `cosmos1address` }
    }
  })

  describe(`Mutations`, () => {
    it(`sets the total delegator rewards earned from all delegations`, async () => {
      mutations.setTotalRewards(state, rewards)
      expect(state.totalRewards).toMatchObject(rewards)
    })

    it(`sets the delegation rewards from a `, () => {
      const validatorAddr = `cosmosvalopr1address`
      mutations.setDelegationRewards(state, { validatorAddr, rewards })
      expect(state.rewards[validatorAddr]).toBe(rewards)
    })

    it(`sets the account public key`, () => {
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

  describe(`Actions`, () => {
    it(`resets the session data `, () => {
      state.rewards = rewards
      const rootState = { distribution: state }
      actions.resetSessionData({ rootState })
      expect(rootState.distribution.rewards).toMatchObject({})
    })

    describe(`getTotalRewards`, () => {
      it(`success`, async () => {
        await actions.getTotalRewards({ state, rootState, commit })
        expect(node.getDelegatorRewards).toHaveBeenCalledWith(rootState.session.address)
        expect(commit).toHaveBeenCalledWith(`setTotalRewards`, rewards)
      })

      it(`fails`, async () => {
        rootState = { session: { address: null } }
        node.getDelegatorRewards = jest.fn(async () => Promise.reject(Error(`invalid address`)))
        await actions.getTotalRewards({ state, rootState, commit })
        expect(node.getDelegatorRewards).toHaveBeenCalledWith(null)
        expect(commit).not.toHaveBeenCalledWith(`setTotalRewards`, rewards)
        expect(commit).toHaveBeenCalledWith(`setDistributionError`, Error(`invalid address`))
      })
    })

    describe(`withdrawAllRewards`, () => {
      it(`success`, async () => {
        await actions.withdrawAllRewards(
          { rootState, dispatch },
          { password: ``, submitType: `ledger` }
        )
        expect(dispatch).toHaveBeenCalledWith(`sendTx`, {
          to: `cosmos1address`,
          type: `postWithdrawDelegatorRewards`,
          password: ``,
          submitType: `ledger`
        })
        expect(dispatch).toHaveBeenCalledWith(`getTotalRewards`)
      })
    })

    describe(`getRewardsFromValidator`, () => {
      it(`success`, async () => {
        const validatorAddr = `cosmosvaloper1address`
        await actions.getRewardsFromValidator({ state, rootState, commit }, validatorAddr)
        expect(node.getDelegatorRewardsFromValidator).toHaveBeenCalledWith(rootState.session.address, validatorAddr)
        expect(commit).toHaveBeenCalledWith(`setDelegationRewards`, { validatorAddr, rewards })
      })

      it(`fails`, async () => {
        const validatorAddr = null
        node.getDelegatorRewardsFromValidator = jest.fn(async () => Promise.reject(Error(`invalid validator address`)))
        await actions.getRewardsFromValidator({ state, rootState, commit }, validatorAddr)
        expect(node.getDelegatorRewardsFromValidator).toHaveBeenCalledWith(rootState.session.address, null)
        expect(commit).not.toHaveBeenCalledWith(`setDelegationRewards`, { validatorAddr, rewards })
        expect(commit).toHaveBeenCalledWith(`setDistributionError`, Error(`invalid validator address`))
      })
    })

    describe(`withdrawRewardsFromValidator`, () => {
      it(`success`, async () => {
        const validatorAddr = `cosmosvaloper1address`
        await actions.withdrawRewardsFromValidator(
          { rootState, commit, dispatch },
          { validatorAddr, password: `1234567890`, submitType: `local` }
        )
        expect(dispatch).toHaveBeenCalledWith(`sendTx`, {
          to: `cosmos1address`,
          pathParameter: validatorAddr,
          type: `postWithdrawDelegatorRewardsFromValidator`,
          password: `1234567890`,
          submitType: `local`
        })
        expect(commit).toHaveBeenCalledWith(`setDelegationRewards`, { validatorAddr, rewards: {} })
        expect(dispatch).toHaveBeenCalledWith(`getTotalRewards`)
        expect(dispatch).toHaveBeenCalledWith(`getRewardsFromValidator`, validatorAddr)
      })
    })

    describe(`getDistributionParameters`, () => {
      it(`success`, async () => {
        await actions.getDistributionParameters({ state, rootState, commit })
        expect(node.getDistributionParameters).toHaveBeenCalled()
        expect(commit).toHaveBeenCalledWith(`setDistributionParameters`, parameters)
      })

      it(`fails`, async () => {
        node.getDelegatorRewardsFromValidator = jest.fn(async () => Promise.reject(Error(`unexpected error`)))
        await actions.getRewardsFromValidator({ state, rootState, commit })
        expect(node.getDistributionParameters).toHaveBeenCalled()
        expect(commit).not.toHaveBeenCalledWith(`setDistributionParameters`, parameters)
        expect(commit).toHaveBeenCalledWith(`setDistributionError`, Error(`unexpected error`))
      })
    })

    describe(`getOutstandingRewards`, () => {
      it(`success`, async () => {
        await actions.getOutstandingRewards({ state, rootState, commit })
        expect(node.getDistributionOutstandingRewards).toHaveBeenCalled()
        expect(commit).toHaveBeenCalledWith(`setOutstandingRewards`, rewards)
      })

      it(`fails`, async () => {
        node.getDistributionOutstandingRewards = jest.fn(async () => Promise.reject(Error(`unexpected error`)))
        await actions.getOutstandingRewards({ state, rootState, commit })
        expect(node.getDistributionOutstandingRewards).toHaveBeenCalled()
        expect(commit).not.toHaveBeenCalledWith(`setOutstandingRewards`, rewards)
        expect(commit).toHaveBeenCalledWith(`setDistributionError`, Error(`unexpected error`))
      })
    })
  })
})
