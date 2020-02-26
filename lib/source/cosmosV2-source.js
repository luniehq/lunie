const CosmosV0API = require('./cosmosV0-source')
const PAGE_RECORDS_COUNT = 100

class CosmosV2API extends CosmosV0API {
  setReducers() {
    this.reducers = require('../reducers/cosmosV2-reducers')
  }

  async query(url) {
    const response = await this.getRetry(url)
    return response.result
  }

  async getValidatorSigningInfos() {
    const signingInfos = await this.query(`slashing/signing_infos`)
    return signingInfos
  }

  async loadPaginatedTxs(url, page = 1, totalAmount = 0) {
    if (page < 1) {
      return []
    }
    const pagination = `&limit=${PAGE_RECORDS_COUNT}&page=${page}`
    let allTxs = []

    const { txs, total_count } = await this.getRetry(`${url}${pagination}`)
    allTxs = allTxs.concat(txs)
    // limitation by totalAmount or by page limit
    if (totalAmount !== 0 || page === 1) {
      return allTxs
    }
    // there is a bug in page_number in gaia-13007 so we can't use is
    if (allTxs.length + totalAmount < Number(total_count)) {
      return allTxs.concat(
        await this.loadPaginatedTxs(url, page - 1, totalAmount + allTxs.length)
      )
    }

    return allTxs
  }

  async getPageCount(url) {
    // hacky way to get page count — requesting too many pages and fetching the error
    let error = await this.getError(
      url + `&limit=${PAGE_RECORDS_COUNT}&page=10000000000000`
    )
    /* The error message received looks like this:
     * {
     *   error: "TxSearch: response error: RPC error -32603 - Internal error: page should be within [0, 7] range, given 100"
     * }
     * We are therefor looking for [0, 7]. The latter of the 2 array entries gives us the last page.
     */
    const pages = error.match(/\[[0-9]*, ([0-9]*)\]/)
    return pages[1]
  }

  async getTransactions(address) {
    this.checkAddress(address)

    // getting page count
    const senderPage = await this.getPageCount(`/txs?message.sender=${address}`)
    const recipientPage = await this.getPageCount(
      `/txs?transfer.recipient=${address}`
    )

    const txs = await Promise.all([
      this.loadPaginatedTxs(`/txs?message.sender=${address}`, senderPage),
      this.loadPaginatedTxs(`/txs?transfer.recipient=${address}`, recipientPage)
    ]).then(([senderTxs, recipientTxs]) => [].concat(senderTxs, recipientTxs))

    return this.reducers.formatTransactionsReducer(txs, this.reducers)
  }

  async getTransactionsV2(address) {
    this.checkAddress(address)

    const txs = await Promise.all([
      this.loadPaginatedTxs(`/txs?message.sender=${address}`),
      this.loadPaginatedTxs(`/txs?transfer.recipient=${address}`)
    ]).then(([senderTxs, recipientTxs]) => [].concat(senderTxs, recipientTxs))

    return this.reducers.transactionsReducerV2(txs, this.reducers)
  }

  extractInvolvedAddresses(transaction) {
    // If the transaction has failed, it doesn't get tagged
    if (!Array.isArray(transaction.events)) return []

    // extract all addresses from events that are either sender or recipient
    const involvedAddresses = transaction.events.reduce(
      (involvedAddresses, event) => {
        const senderAttributes = event.attributes
          .filter(({ key }) => key === 'sender')
          .map(sender => sender.value)
        if (senderAttributes.length) {
          involvedAddresses = [...involvedAddresses, ...senderAttributes]
        }

        const recipientAttribute = event.attributes.find(
          ({ key }) => key === 'recipient'
        )
        if (recipientAttribute) {
          involvedAddresses.push(recipientAttribute.value)
        }

        return involvedAddresses
      },
      []
    )
    return involvedAddresses
  }

  async getTransactionsByHeight(height) {
    const txs = await this.loadPaginatedTxs(`txs?tx.height=${height}`)
    return Array.isArray(txs)
      ? txs.map(transaction =>
          this.reducers.transactionReducer(transaction, this.reducers)
        )
      : []
  }

  async getRewards(delegatorAddress, validatorsDictionary) {
    this.checkAddress(delegatorAddress)
    const result = await this.query(
      `distribution/delegators/${delegatorAddress}/rewards`
    )
    return (result.rewards || [])
      .filter(({ reward }) => reward && reward.length > 0)
      .map(({ reward, validator_address }) =>
        this.reducers.rewardReducer(
          reward[0],
          validatorsDictionary[validator_address]
        )
      )
  }
}

module.exports = CosmosV2API
