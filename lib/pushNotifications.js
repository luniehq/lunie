const { eventSubscription } = require('./subscriptions')
const config = require('../config.js')
var admin = require('firebase-admin')

function getMessageBody(eventType) {
  switch (eventType) {
    case 'transaction':
      return 'You have received a transaction!'
    default:
      return 'Check it out!'
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
  const body = getMessageBody(event.eventType)

  const message = {
    notification: {
      title: 'Update in Lunie',
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
    await admin.messaging().send(message)
  } catch (error) {
    console.error('Error sending message:', error, message)
  }
}

// Topics need to be one string
// i.e. block_cosmos-hub-mainnet or cosmos1aswiocxzoqoidio_transaction_cosmos-hub-mainnet
function getTopic({ networkId, eventType, resourceId }) {
  return [resourceId, eventType, networkId].filter(x => !!x).join('_')
}

function getPushLink(eventType, networkSlug) {
  switch (eventType) {
    case 'transaction':
      return `${config.firebasePushNotificationsFrontendUrl}/${networkSlug}/transactions`
    default:
      return config.firebasePushNotificationsFrontendUrl
  }
}

// users need to be registered individually per topic
function subscribeUser(registrationToken, topics) {
  return Promise.all(
    topics.map(topic =>
      admin.messaging().subscribeToTopic(registrationToken, topic)
    )
  )
}

// users stay registered, we need to manually unregister them
function unsubscribeUser(registrationToken, topics) {
  return Promise.all(
    topics.map(topic =>
      admin.messaging().unsubscribeFromTopic(registrationToken, topic)
    )
  )
}

const startPushingEvents = () => {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: config.firebaseDatabaseUrl
  })

  // listens on the graphQL subscription for events
  // in the app, create an event via pushEvent from `subscription.js`
  eventSubscription(event => {
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
  console.error('No Firebase Admin Key set so skipping push notifications')

  module.exports = {
    startPushingEvents: () => {},
    subscribeUser: () => {},
    unsubscribeUser: () => {},
    getTopic,
    getMessageBody
  }
}
