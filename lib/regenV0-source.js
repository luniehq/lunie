const CosmosV0API = require('./cosmosV0-source')
const { transactionReducer } = require('./reducers/cosmosV0-reducers')
const { uniqWith, sortBy, reverse } = require('lodash')

class RegenV0API extends CosmosV0API {
  constructor(network) {
    super(network)

    this.delegatorBech32Prefix = `xrn:`
    this.validatorConsensusBech32Prefix = `xrn:valcons`
  }
  setReducers() {
    this.reducers = require('./reducers/regenV0-reducers')
  }

  async getTransactionsByHeight(height) {
    const { txs } = await this.get(`txs?tx.height=${height}`)
    return Array.isArray(txs)
      ? txs.map(transaction => this.reducers.transactionReducer(transaction))
      : []
  }

  async getTransactions(address) {
    const pagination = `&limit=${1000000000}`

    const txs = await Promise.all([
      this.get(`/txs?sender=${address}${pagination}`).then(({ txs }) => txs),
      this.get(`/txs?recipient=${address}${pagination}`).then(({ txs }) => txs)
    ]).then(([senderTxs, recipientTxs]) => [].concat(senderTxs, recipientTxs))

    const dupFreeTxs = uniqWith(txs, (a, b) => a.txhash === b.txhash)
    const sortedTxs = sortBy(dupFreeTxs, ['timestamp'])
    const reversedTxs = reverse(sortedTxs)
    return reversedTxs.map(transactionReducer)
  }
}

module.exports = RegenV0API
