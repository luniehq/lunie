const CosmosV0API = require('./cosmosV0-source')

const { transactionReducer } = require('./reducers/cosmosV0-reducers')
const { uniqWith, sortBy, reverse } = require('lodash')

class CosmosV2API extends CosmosV0API {
  setReducers() {
    this.reducers = require('./reducers/cosmosV2-reducers')
  }

  async query(url) {
    const response = await this.get(url)
    return response.result
  }

  async getValidatorSigningInfos() {
    const signingInfos = await this.query(`slashing/signing_infos`)
    return signingInfos
  }

  async getTransactions(address) {
    const pagination = `&limit=${1000000000}`

    const txs = await Promise.all([
      this.get(`/txs?message.sender=${address}${pagination}`).then(
        ({ txs }) => txs
      ),
      this.get(`/txs?message.recipient=${address}${pagination}`).then(
        ({ txs }) => txs
      )
    ]).then(([senderTxs, recipientTxs]) => [].concat(senderTxs, recipientTxs))

    const dupFreeTxs = uniqWith(txs, (a, b) => a.txhash === b.txhash)
    const sortedTxs = sortBy(dupFreeTxs, ['timestamp'])
    const reversedTxs = reverse(sortedTxs)
    return reversedTxs.map(transactionReducer)
  }

  extractInvolvedAddresses(transaction) {
    console.log('TODO extractInvolvedAddresses', transaction)
    return []
  }

  async getRewards(delegatorAddress) {
    const { rewards } = await this.query(
      `distribution/delegators/${delegatorAddress}/rewards`
    )
    const validators = await this.getAllValidators()
    return rewards
      .filter(({ rewards }) => !!rewards)
      .map(({ rewards, validator_address }) =>
        this.reducers.rewardReducer(
          rewards[0],
          validators.find(
            ({ operatorAddress }) => validator_address === operatorAddress
          )
        )
      )
  }
}

module.exports = CosmosV2API
