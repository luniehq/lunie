const { PubSub } = require('apollo-server')
const pubsub = new PubSub()

const NEW_BLOCK = 'NEW_BLOCK'
const NEW_USER_TRANSACTION = 'NEW_USER_TRANSACTION'

// This file exports functions used to listen and publish data to 
// particular  message channels. Used to handle GraphQL subscriptions.
module.exports = {
  blockAdded: networkId => pubsub.asyncIterator([`${networkId}_${NEW_BLOCK}`]),

  publishBlockAdded: (networkId, block) =>
    pubsub.publish(`${networkId}_${NEW_BLOCK}`, { blockAdded: block }),

  userTransactionAdded: (networkId, userAddress) =>
    pubsub.asyncIterator([
      `${networkId}_${NEW_USER_TRANSACTION}_${userAddress}`
    ]),

  publishUserTransactionAdded: (networkId, userAddress, transaction) => {
    return pubsub.publish(
      `${networkId}_${NEW_USER_TRANSACTION}_${userAddress}`,
      {
        userTransactionAdded: transaction
      }
    )
  }
}
