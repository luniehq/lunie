const { PubSub } = require('apollo-server')
const pubsub = new PubSub()
let Tendermint = require('./helpers/tendermint')

const NEW_BLOCK = 'NEW_BLOCK'
const NEW_USER_TRANSACTION = 'NEW_USER_TRANSACTION'

module.exports = {
  client: url => Tendermint().connect(url),
  blockAdded: networkId => pubsub.asyncIterator([`${networkId}_${NEW_BLOCK}`]),

  publishBlockAdded: (networkId, block) =>
    pubsub.publish(`${networkId}_${NEW_BLOCK}`, { blockAdded: block }),

  userTransactionAdded: (networkId, userAddress) =>
    pubsub.asyncIterator([
      `${networkId}_${NEW_USER_TRANSACTION}_${userAddress}`
    ]),

  publishUserTransactionAdded: (networkId, userAddress, transaction) => {
    console.log(`publishUserTransactionAdded`, userAddress, transaction.type)
    return pubsub.publish(
      `${networkId}_${NEW_USER_TRANSACTION}_${userAddress}`,
      {
        userTransactionAdded: transaction
      }
    )
  }
}
