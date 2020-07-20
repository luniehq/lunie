const { PubSub } = require('apollo-server')
const config = require('../config')
const { createRedisPubSub } = require('./redis')
const {
  getDefaultSubscriptions
} = require('./notifications/notifications-types')

const pubsub = getPubSub()

const NEW_BLOCK = 'NEW_BLOCK'
const NEW_USER_TRANSACTION = 'NEW_USER_TRANSACTION'
const NEW_EVENT = 'NEW_EVENT'

// This file exports functions used to listen and publish data to
// particular  message channels. Used to handle GraphQL subscriptions.
module.exports = {
  blockAdded: (networkId) =>
    pubsub.asyncIterator([`${networkId}_${NEW_BLOCK}`]),

  publishBlockAdded: (networkId, block) =>
    pubsub.publish(`${networkId}_${NEW_BLOCK}`, { blockAdded: block }),

  notificationAdded: async (addressObjects, dataSources) => {
    const defaultSubscriptions = await getDefaultSubscriptions(
      addressObjects,
      dataSources
    )
    return pubsub.asyncIterator(defaultSubscriptions)
  },

  publishNotificationAdded: (notification, topic) =>
    pubsub.publish(`${topic}`, { notificationAdded: notification }),

  userTransactionAdded: (networkId, userAddress) =>
    pubsub.asyncIterator([
      `${networkId}_${NEW_USER_TRANSACTION}_${userAddress}`
    ]),

  userTransactionV2Added: (networkId, userAddress) =>
    pubsub.asyncIterator([
      `${networkId}_${NEW_USER_TRANSACTION}_${userAddress}_v2`
    ]),

  publishUserTransactionAdded: (networkId, userAddress, transaction) => {
    return pubsub.publish(
      `${networkId}_${NEW_USER_TRANSACTION}_${userAddress}`,
      {
        userTransactionAdded: transaction
      }
    )
  },

  publishUserTransactionAddedV2: (networkId, userAddress, transaction) => {
    return pubsub.publish(
      `${networkId}_${NEW_USER_TRANSACTION}_${userAddress}_v2`,
      {
        userTransactionAddedV2: transaction
      }
    )
  },

  event: () => pubsub.asyncIterator([NEW_EVENT]),
  eventSubscription: (callback) =>
    pubsub.subscribe(NEW_EVENT, ({ event }) =>
      callback({
        ...event,
        properties: JSON.parse(event.properties)
      })
    ),

  publishEvent: (networkId, resourceType, eventType, resourceId, properties) =>
    pubsub.publish(NEW_EVENT, {
      event: {
        networkId,
        resourceType,
        eventType,
        resourceId,
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
