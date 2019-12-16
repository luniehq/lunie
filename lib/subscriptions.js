const { PubSub } = require('apollo-server')
const config = require('../config')
const { createRedisPubSub } = require('./redis')

const pubsub = getPubSub()

const NEW_BLOCK = 'NEW_BLOCK'
const NEW_USER_TRANSACTION = 'NEW_USER_TRANSACTION'
const NEW_EVENT = 'NEW_EVENT'

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
  },

  event: () => pubsub.asyncIterator([NEW_EVENT]),
  eventSubscription: callback =>
    pubsub.subscribe(NEW_EVENT, ({ event }) =>
      callback({
        ...event,
        properties: JSON.parse(event.properties)
      })
    ),

  publishEvent: (networkId, eventType, ressourceId, properties) =>
    pubsub.publish(NEW_EVENT, {
      event: {
        networkId,
        eventType,
        ressourceId,
        properties: JSON.stringify(properties)
      }
    })
}

// the normal apollo server pub sub has limitations on the maximum of connections: https://stackoverflow.com/questions/43752073/graphql-subscriptions-max-listeners-exceeded-warning
// this is why we use Redis PubSub in production
function getPubSub() {
  // default to EventEmitter pubsub
  if (!config.redis_url) {
    return new PubSub()
  }

  return createRedisPubSub()
}
