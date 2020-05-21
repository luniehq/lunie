const {
  eventSubscription,
  publishNotificationAdded
} = require('./subscriptions')
const {
  eventTypes,
  resourceTypes,
  getDefaultSubscriptions
} = require('./notifications-types')
const networks = require('../data/networks')
const database = require('./database')
const config = require('../config.js')

function getMessageTitle(notification) {
  // Need to decode JSOn string from Hasura as it escapes strings
  // e.g. a quote " is represented as &quot; - need to reverse this with the below operation
  const data = JSON.parse(notification.data.replace(/&quot;/g, '"'))
  switch (notification.eventType) {
    case eventTypes.TRANSACTION_RECEIVE:
      return `You have received ${data.details.amount.amount} ${
        data.details.amount.denom
      }${data.details.amount.amount !== 1 ? 's' : ''} on ${findNetworkTitle(
        notification.networkId
      )}`
    case eventTypes.TRANSACTION_SEND:
      return `You sent ${data.details.amount.amount} ${
        data.details.amount.denom
      }${data.details.amount.amount !== 1 ? 's' : ''}
      on ${findNetworkTitle(notification.networkId)}`
    case eventTypes.PROPOSAL_CREATE:
      return `New proposal created for ${findNetworkTitle(
        notification.networkId
      )}: ${data.title}`
    case eventTypes.PROPOSAL_UPDATE:
      return `Proposal status changed to ${data.status} on ${findNetworkTitle(
        notification.networkId
      )} for ${data.title}`
    default:
      return 'Check it out! 👋'
  }
}

function findNetworkTitle(networkId) {
  const network = networks.find((network) => network.id === networkId)
  return network.title
}

function findNetworkSlug(networkId) {
  const network = networks.find((network) => network.id === networkId)
  return network.slug
}

function getPushLink({ resourceType, networkId, resourceId }) {
  switch (resourceType) {
    case resourceTypes.TRANSACTION:
      return `/${findNetworkSlug(networkId)}/transactions`
    case resourceTypes.PROPOSAL:
      return `/${findNetworkSlug(networkId)}/proposals/${resourceId}`
    default:
      return `/`
  }
}

// Get relevant icon for notification
// TODO: Upload icons to DO instead of passing relative links
function getIcon({ eventType }) {
  switch (eventType) {
    case eventTypes.TRANSACTION_RECEIVE:
      return `/img/icons/activity/Received.svg`
    case eventTypes.TRANSACTION_SEND:
      return `/img/icons/activity/Sent.svg`
    case eventTypes.PROPOSAL_CREATE || eventTypes.PROPOSAL_UPDATE:
      return `/img/icons/activity/Submitted.svg`
    default:
      return `/img/icons/currencies/lunie.png`
  }
}

// Topics creation method
// i.e. block_cosmos-hub-mainnet or cosmos1aswiocxzoqoidio_transaction_cosmos-hub-mainnet
function getTopic({ resourceType, networkId, eventType, resourceId }) {
  let data = [resourceId, eventType, networkId]
  if (resourceType === resourceTypes.PROPOSAL) data = [eventType, networkId]

  return data.filter((x) => !!x).join('_')
}

const startNotificationService = () => {
  // listens on the graphQL subscription for events
  eventSubscription(async (event) => {
    if (event.properties.type === 'UnknownTx') return

    const topic = getTopic(event)
    const response = await database(config)('').storeNotification({
      topic,
      eventType: event.eventType,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      networkId: event.networkId,
      data: JSON.stringify(event.properties)
    })

    const notificationResponse = response.data.insert_notifications.returning[0]
    const notification = {
      networkId: event.networkId,
      timestamp: notificationResponse.created_at,
      title: getMessageTitle(notificationResponse),
      link: getPushLink(notificationResponse),
      icon: getIcon(notificationResponse)
    }

    publishNotificationAdded(notification, topic)
  })
}

// Resolver for retrieving notifications
const getNotifications = async (
  _,
  { numberOfNotifications = 10, addressObjects }
) => {
  if (addressObjects.length === 0) return { notifications: [] }

  const defaultSubscriptions = getDefaultSubscriptions(addressObjects)
  const relevantNotifications = await database(config)('').getNotifications(
    defaultSubscriptions,
    numberOfNotifications
  )

  const notifications = relevantNotifications.map((notification) => ({
    networkId: notification.networkId, // used for filtering per network
    timestamp: notification.created_at, // used for grouping / sorting
    title: getMessageTitle(notification), // title of notification
    link: getPushLink(notification), // link for click-through action
    icon: getIcon(notification) // icon link
  }))

  return notifications
}

module.exports = {
  startNotificationService,
  getTopic,
  getPushLink,
  getMessageTitle,
  getNotifications
}
