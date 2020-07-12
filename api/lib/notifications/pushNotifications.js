const { eventSubscription } = require('../subscriptions')
const { eventTypes } = require('./pushNotifications-format')
const config = require('../../config.js')
const firebaseAdmin = require('../firebase')

function getMessageBody(eventType, event) {
  switch (eventType) {
    case eventTypes.TRANSACTION:
      return `You have received ${event.properties.details.amount.amount} ${event.properties.details.amount.denom} on ${event.networkSlug}`
    case eventTypes.PROPOSAL_CREATE:
      return `${event.properties.title}`
    case eventTypes.PROPOSAL_UPDATE:
      return `For ${event.properties.title} on ${event.networkSlug}`
    default:
      return 'Check it out! 👋'
  }
}

function getMessageTitle(eventType, event) {
  switch (eventType) {
    case eventTypes.TRANSACTION:
      return 'Incoming transaction! 🚀'
    case eventTypes.PROPOSAL_CREATE:
      return `New proposal for ${event.networkSlug} ✅`
    case eventTypes.PROPOSAL_UPDATE:
      return `Proposal status changed to ${event.properties.status}`
    default:
      return 'Check it out! 👋'
  }
}

/**
 *
 * @param {string} topic
 * @param {Object} event
 * @param {Object} event.networkId: 'cosmos-hub-testnet'
 * @param {Object} event.eventType: 'transaction'
 * @param {Object} event.resourceId: 'cosmos1amh6f8cfm3k3ys8n695p4a3ccqrfu8nc37gfpe'
 * @param {Object} event.properties: Transaction object (details, success, height, involvedAddresses)
 */
async function pushToTopic(topic, event) {
  const title = getMessageTitle(event.eventType, event)
  const body = getMessageBody(event.eventType, event)

  const message = {
    notification: {
      title,
      body,
      image:
        'https://lunie.fra1.digitaloceanspaces.com/lunie-push-notification.PNG'
    },
    data: {
      event: JSON.stringify(event)
    },
    topic,
    webpush: {
      fcm_options: {
        link: getPushLink(event.eventType, event.networkSlug)
      }
    }
  }

  try {
    await firebaseAdmin.messaging().send(message)
  } catch (error) {
    console.error('Error sending message:', error, message)
  }
}

// Topics need to be one string
// i.e. block_cosmos-hub-mainnet or cosmos1aswiocxzoqoidio_transaction_cosmos-hub-mainnet
function getTopic({ networkId, eventType, resourceId }) {
  let data = [resourceId, eventType, networkId]
  if (
    eventType === eventTypes.PROPOSAL_CREATE ||
    eventType === eventTypes.PROPOSAL_UPDATE
  )
    data = [eventType, networkId] // Not possible to subscribe for future proposals

  return data.filter((x) => !!x).join('_')
}

function getPushLink(eventType, networkSlug) {
  switch (eventType) {
    case eventTypes.TRANSACTION:
      return `${config.firebasePushNotificationsFrontendUrl}/${networkSlug}/transactions`
    case eventTypes.PROPOSAL_CREATE || eventTypes.PROPOSAL_UPDATE:
      return `${config.firebasePushNotificationsFrontendUrl}/${networkSlug}/proposals`
    default:
      return config.firebasePushNotificationsFrontendUrl
  }
}

// users need to be registered individually per topic
function subscribeUser(registrationToken, topics) {
  return Promise.all(
    topics.map((topic) =>
      firebaseAdmin.messaging().subscribeToTopic(registrationToken, topic)
    )
  )
}

// users stay registered, we need to manually unregister them
function unsubscribeUser(registrationToken, topics) {
  return Promise.all(
    topics.map((topic) =>
      firebaseAdmin.messaging().unsubscribeFromTopic(registrationToken, topic)
    )
  )
}

const startPushingEvents = () => {
  // listens on the graphQL subscription for events
  // in the app, create an event via pushEvent from `subscription.js`
  eventSubscription((event) => {
    if (event.properties.type === 'UnknownTx') return
    pushToTopic(getTopic(event), event)
  })
}

module.exports = {
  startPushingEvents,
  subscribeUser,
  unsubscribeUser,
  getTopic,
  getMessageBody
}

/*
 * Uses Firebase Cloud Messaging to send push notifications to users
 * Users need to register themselves by providing their push API tokens and topics they would like to listen for
 */

if (!config.firebaseAdminKeySet) {
  console.error('No Firebase firebaseAdmin Key set so skipping push notifications')

  module.exports = {
    startPushingEvents: () => {},
    subscribeUser: () => {},
    unsubscribeUser: () => {},
    getTopic,
    getMessageBody
  }
}
