const BigNumber = require('bignumber.js')

class polkadotAPI {
  constructor(network, store) {
    this.network = network
    this.setReducers()
    this.store = store
  }

  setReducers() {
    this.reducers = require('../reducers/polkadotV0-reducers')
  }

  // rpc initialization is async so we always need to assume we need to wait for it to be initialized
  async getAPI() {
    const api = this.store.polkadotRPC
    await api.isReady
    return api
  }

  async getBlockHeight() {
    const api = await this.getAPI()
    const block = await api.rpc.chain.getBlock()
    return block.block.header.number.toNumber()
  }

  async getBlockByHeight(blockHeight) {
    const api = await this.getAPI()

    // heavy nesting to provide optimal parallelization here
    const [
      [{ author }, blockEvents, blockHash],
      sessionIndex
    ] = await Promise.all([
      api.rpc.chain.getBlockHash(blockHeight).then(async blockHash => {
        const [{ author }, blockEvents] = await Promise.all([
          api.derive.chain.getHeader(blockHash),
          api.query.system.events.at(blockHash)
        ])

        return [{ author }, blockEvents, blockHash]
      }),
      api.query.babe.epochIndex()
    ])

    return this.reducers.blockReducer(
      this.networkId,
      blockHeight,
      blockHash,
      sessionIndex.toNumber(),
      author,
      blockEvents
    )
  }

  async getAllValidators() {
    console.time(`getAllValidators`)

    const api = await this.getAPI()

    // Fetch all stash addresses for current session (including validators and intentions)
    const allStashAddresses = await api.derive.staking.stashes()

    // Fetch active validator addresses for current session.
    const validatorAddresses = await api.query.session.validators()

    // Fetch all validators staking info
    let allValidators = await Promise.all(
      allStashAddresses.map(authorityId =>
        api.derive.staking.account(authorityId)
      )
    )
    allValidators = JSON.parse(JSON.stringify(allValidators))

    // Calculate and update total active staked funds
    let networkTotalStake = new BigNumber(0)
    allValidators
      .filter(validator => validatorAddresses.includes(validator.accountId))
      .forEach(validator => {
        if (validator.exposure) {
          const accum = new BigNumber(validator.exposure.total)
          networkTotalStake = networkTotalStake.plus(accum)
        }
      })

    // Fetch identity info
    let allValidatorsIdentity = await Promise.all(
      allStashAddresses.map(authorityId =>
        api.derive.accounts.info(authorityId)
      )
    )
    allValidatorsIdentity = JSON.parse(JSON.stringify(allValidatorsIdentity))

    allValidators.forEach(validator => {
      if (validatorAddresses.includes(validator.accountId)) {
        validator.status = `ACTIVE`
      } else {
        validator.status = `INACTIVE`
      }
      const identity = allValidatorsIdentity.find(
        validatorIdentity => validatorIdentity.accountId === validator.accountId
      )
      validator.identity = JSON.parse(JSON.stringify(identity.identity))
      if (validator.exposure) {
        const validatorStake = new BigNumber(validator.exposure.total)
        validator.votingPower = validatorStake.div(networkTotalStake).toNumber()
        validator.tokens =
          validatorStake *
          this.network.coinLookup[0].chainToViewConversionFactor
        validator.nominations = JSON.parse(
          JSON.stringify(validator.exposure.others)
        ) // Added for faster delegations search
      } else {
        validator.votingPower = 0
      }
    })
    console.timeEnd(`getAllValidators`)
    return allValidators.map(validator =>
      this.reducers.validatorReducer(this.network, validator)
    )
  }

  async getSelfStake(validator) {
    return validator.selfStake
  }

  async getBalancesFromAddress(address) {
    const api = await this.getAPI()
    const account = await api.query.system.account(address)
    const totalBalance = account.data.free
    const freeBalance = BigNumber(totalBalance.toString()).minus(
      account.data.miscFrozen.toString()
    )
    return this.reducers.balanceReducer(
      this.network,
      freeBalance.toString(),
      totalBalance.toString()
    )
  }

  async getExpectedReturns() {
    return null
  }

  async getRewards() {
    return null
  }

  async getOverview(delegatorAddress) {
    const accountBalances = await this.getBalancesFromAddress(delegatorAddress)

    return {
      networkId: this.networkId,
      address: delegatorAddress,
      totalStake: accountBalances[0].total,
      totalStakeFiatValue: '',
      liquidStake: accountBalances[0].amount,
      totalRewards: '',
      rewards: undefined,
      accountInformation: undefined
    }
  }

  getAccountInfo() {
    return null
  }

  async getDelegationsForDelegatorAddress(
    delegatorAddress,
    validatorsDictionary
  ) {
    let delegations = []
    Object.values(validatorsDictionary).forEach(validator => {
      validator.nominations.forEach(nomination => {
        if (delegatorAddress === nomination.who) {
          delegations.push(
            this.reducers.delegationReducer(this.network, nomination, validator)
          )
        }
      })
    })
    return delegations
  }

  // TODO: find out how to get all undelegations in Polkadot
  getUndelegationsForDelegatorAddress() {
    return []
  }
}

module.exports = polkadotAPI
