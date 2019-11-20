const CosmosV2API = require('./cosmosV2-source')
const BigNumber = require('bignumber.js')
const { keyBy } = require('lodash')
const { pubkeyToAddress } = require('./tools')

class TerraV3API extends CosmosV2API {
  setReducers() {
    this.reducers = require('./reducers/terraV3-reducers')
  }

  async getAllValidators() {
    let [validators, validatorSet, signedBlocksWindow] = await Promise.all([
      Promise.all([
        this.query(`staking/validators?status=unbonding`),
        this.query(`staking/validators?status=bonded`),
        this.query(`staking/validators?status=unbonded`)
      ]).then(validatorGroups => [].concat(...validatorGroups)),
      this.getAllValidatorSets(),
      this.getSignedBlockWindow()
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

    // Terra is provisioning this amount manually https://medium.com/terra-money/project-santa-community-initiative-b8ab6c4d79be
    const annualProvision = '21700000000000' // 21.7 million in uluna

    return validators.map(validator =>
      this.reducers.validatorReducer(
        this.networkId,
        signedBlocksWindow,
        validator,
        annualProvision
      )
    )
  }

  //   async getTransactions(address) {
  //     const pagination = `&limit=${1000000000}`

  //     const txs = await Promise.all([
  //       this.get(`/txs?sender=${address}${pagination}`),
  //       this.get(`/txs?recipient=${address}${pagination}`),
  //       this.get(`/txs?action=submit_proposal&proposer=${address}${pagination}`),
  //       this.get(`/txs?action=deposit&depositor=${address}${pagination}`),
  //       this.get(`/txs?action=vote&voter=${address}${pagination}`),
  //       // this.get(`/txs?action=create_validator&destination-validator=${valAddress}`), // TODO
  //       // this.get(`/txs?action=edit_validator&destination-validator=${valAddress}`), // TODO
  //       this.get(`/txs?action=delegate&delegator=${address}${pagination}`),
  //       this.get(
  //         `/txs?action=begin_redelegate&delegator=${address}${pagination}`
  //       ),
  //       this.get(`/txs?action=begin_unbonding&delegator=${address}${pagination}`),
  //       // this.get(`/txs?action=unjail&source-validator=${address}`), // TODO
  //       // this.get(`/txs?action=set_withdraw_address&delegator=${address}`), // other
  //       this.get(
  //         `/txs?action=withdraw_delegator_reward&delegator=${address}${pagination}`
  //       ),
  //       this.get(
  //         `/txs?action=withdraw_validator_rewards_all&source-validator=${address}${pagination}`
  //       )
  //     ]).then(transactionGroups => [].concat(...transactionGroups))

  //     const duplicateFreeTxs = uniqWith(txs, (a, b) => a.txhash === b.txhash)
  //     const sortedTxs = sortBy(duplicateFreeTxs, ['timestamp'])
  //     const reversedTxs = reverse(sortedTxs)
  //     return reversedTxs.map(this.reducers.transactionReducer)
  //   }
}

module.exports = TerraV3API
