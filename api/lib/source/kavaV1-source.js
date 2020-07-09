const KavaV0API = require('./kavaV0-source')

class KavaV1API extends KavaV0API {
  setReducers() {
    this.reducers = require('../reducers/kavaV1-reducers')
  }

  async getBlockByHeightV2(blockHeight) {
    let block, transactions
    if (blockHeight) {
      const response = await Promise.all([
        this.getRetry(`blocks/${blockHeight}`),
        this.getTransactionsV2ByHeight(blockHeight)
      ])
      block = response[0]
      transactions = response[1]
    } else {
      block = await this.getRetry(`blocks/latest`)
      transactions = await this.getTransactionsV2ByHeight(
        block.block.header.height
      )
    }
    return this.reducers.blockReducer(this.network.id, block, transactions)
  }
}

module.exports = KavaV1API
