const CosmosV2API = require('./cosmosV2-source')
const BigNumber = require('bignumber.js')
const { keyBy } = require('lodash')
const { pubkeyToAddress } = require('../tools')

const gasPrices = [
  {
    denom: 'ukrw',
    price: '0.091'
  },
  {
    denom: 'uluna',
    price: '0.001'
  },
  {
    denom: 'umnt',
    price: '0.091'
  },
  {
    denom: 'usdr',
    price: '0.091'
  },
  {
    denom: 'uusd',
    price: '0.091'
  }
]

class TerraV3API extends CosmosV2API {
  setReducers() {
    this.reducers = require('../reducers/terraV3-reducers')
    this.gasPrices = gasPrices
  }

  async getAllValidators(height) {
    let [
      validators,
      validatorSet,
      signedBlocksWindow,
      expectedReturns
    ] = await Promise.all([
      Promise.all([
        this.query(`staking/validators?status=unbonding`),
        this.query(`staking/validators?status=bonded`),
        this.query(`staking/validators?status=unbonded`)
      ]).then(validatorGroups => [].concat(...validatorGroups)),
      this.getAllValidatorSets(height),
      this.getSignedBlockWindow(),
      this.query(`v1/staking`, 'validators')
    ])

    // create a dictionary to reduce array lookups
    const consensusValidators = keyBy(validatorSet.validators, 'address')
    const totalVotingPower = validatorSet.validators.reduce(
      (sum, { voting_power }) => sum.plus(voting_power),
      BigNumber(0)
    )

    // query for signing info
    const signingInfos = keyBy(
      await this.getValidatorSigningInfos(validators),
      'address'
    )

    const expectedReturnsMap = keyBy(expectedReturns, 'operatorAddress')

    validators.forEach(validator => {
      const consensusAddress = pubkeyToAddress(
        validator.consensus_pubkey,
        this.validatorConsensusBech32Prefix
      )
      validator.voting_power = consensusValidators[consensusAddress]
        ? BigNumber(consensusValidators[consensusAddress].voting_power)
            .div(totalVotingPower)
            .toNumber()
        : 0
      validator.signing_info = signingInfos[consensusAddress]
    })

    return validators.map(validator => {
      const lunieValidator = this.reducers.validatorReducer(
        this.networkId,
        signedBlocksWindow,
        validator
      )

      lunieValidator.expectedReturns = expectedReturnsMap[
        lunieValidator.operatorAddress
      ]
        ? expectedReturnsMap[lunieValidator.operatorAddress].stakingReturn
        : 0

      return lunieValidator
    })
  }

  async getExpectedReturns(validator) {
    return Number(validator.expectedReturns).toFixed(4)
  }

  async insertFiatValueinRewards(rewards, fiatCurrency) {
    return await Promise.all(
      rewards.map(
        async reward =>
          (reward = {
            ...reward,
            reward: await Promise.all(
              reward.reward.map(
                async denomReward =>
                  (denomReward = {
                    ...denomReward,
                    fiatValue: await this.calculateFiatValue(
                      denomReward,
                      fiatCurrency
                    )
                  })
              )
            )
          })
      )
    )
  }

  // Terra will be the root source for functions specific to Tendermint multidenom networks
  async getRewards(delegatorAddress, validatorsDictionary, fiatCurrency) {
    this.checkAddress(delegatorAddress)
    const result = await this.query(
      `distribution/delegators/${delegatorAddress}/rewards`
    )
    const rewards = (result.rewards || []).filter(
      ({ reward }) => reward && reward.length > 0
    )
    const rewardsWithFiatValue = await this.insertFiatValueinRewards(
      rewards,
      fiatCurrency
    )
    return this.reducers.rewardReducer(
      rewardsWithFiatValue,
      validatorsDictionary
    )
  }

  async calculateFiatValues(balances, fiatCurrency) {
    return Promise.all(
      balances.map(async balance => ({
        denom: this.reducers.coinReducer(balance).denom,
        fiatValue: this.calculateFiatValue
          ? await this.calculateFiatValue(balance, fiatCurrency)
          : null
      }))
    )
  }

  async getBalancesFromAddress(address, fiatCurrency = `EUR`) {
    this.checkAddress(address)
    const response = await this.query(`bank/balances/${address}`)
    let balances = response || []
    const coins = balances.map(this.reducers.coinReducer)
    // We calculate the fiatValue field for networks with multiple tokens
    // For now, it is just e-Money (probably also Terra)
    const fiatBalances = await this.calculateFiatValues(balances, fiatCurrency)
    return coins.map(coin => {
      return this.reducers.balanceReducer(
        coin,
        fiatBalances
          ? fiatBalances.find(({ denom }) => denom === coin.denom).fiatValue
          : null,
        this.gasPrices
      )
    })
  }
}

module.exports = TerraV3API
