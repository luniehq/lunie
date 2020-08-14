const { UserInputError } = require('apollo-server')
const Sentry = require('@sentry/node')
const {
  eventSubscription,
  publishNotificationAdded
} = require('../subscriptions')
const {
  eventTypes,
  resourceTypes,
  getDefaultSubscriptions
} = require('./notifications-types')
const database = require('../database')
const config = require('../../config.js')

function getMessageTitle(networks, notification) {
  const data = notification.properties || JSON.parse(notification.data)
  const networkTitle = findNetworkTitle(networks, notification.networkId)

  switch (notification.eventType) {
    case eventTypes.TRANSACTION_RECEIVE:
      return `You received ${data.details.amount.amount} ${
        data.details.amount.denom
      }${data.details.amount.amount !== 1 ? 's' : ''} on ${networkTitle}`
    case eventTypes.TRANSACTION_SEND:
      return `You sent ${data.details.amount.amount} ${
        data.details.amount.denom
      }${data.details.amount.amount !== 1 ? 's' : ''} on ${networkTitle}`
    case eventTypes.PROPOSAL_CREATE:
      return `New proposal created for ${networkTitle}: '${data.title}'`
    case eventTypes.PROPOSAL_UPDATE:
      return `${networkTitle} proposal status changed to '${data.status}' for ${data.title}`

    /* validator changes */
    case eventTypes.VALIDATOR_COMMISSION:
      return `${notification.resourceId} changed their commission rate from ${data.prevValidator.commission} to ${data.nextValidator.commission} on ${networkTitle}`

    case eventTypes.VALIDATOR_VOTING_POWER_INCREASE: {
      const prevVotingPower = Number(data.prevValidator.votingPower)
      const nextVotingPower = Number(data.nextValidator.votingPower)
      const percentageDifference =
        (100 * (nextVotingPower - prevVotingPower)) /
        ((nextVotingPower + prevVotingPower) / 2)

      return `Voting power increased from ${Number(
        data.prevValidator.votingPower
      ).toFixed(2)}% to ${Number(data.nextValidator.votingPower).toFixed(
        2
      )}% (${percentageDifference.toFixed(3)}% increase) for ${
        data.nextValidator.name
      } on ${networkTitle}`
    }

    case eventTypes.VALIDATOR_VOTING_POWER_DECREASE: {
      const prevVotingPower = Number(data.prevValidator.votingPower)
      const nextVotingPower = Number(data.nextValidator.votingPower)
      const percentageDifference =
        (100 * (nextVotingPower - prevVotingPower)) /
        ((nextVotingPower + prevVotingPower) / 2)

      return `Voting power decreased from ${Number(
        data.prevValidator.votingPower
      ).toFixed(2)}% to ${Number(data.nextValidator.votingPower).toFixed(
        2
      )}% (${percentageDifference.toFixed(2)}% decrease) for ${
        data.nextValidator.name
      } on ${networkTitle}`
    }

    case eventTypes.VALIDATOR_MAX_CHANGE_COMMISSION:
      return `Max commission fee for ${
        data.nextValidator.name
      } has changed from ${Number(
        data.prevValidator.maxChangeCommission
      ).toFixed(3)} to ${Number(data.nextValidator.maxChangeCommission).toFixed(
        3
      )} on ${networkTitle}`
    case eventTypes.VALIDATOR_DESCRIPTION:
      return `${data.nextValidator.name} changed their description on ${networkTitle}`
    case eventTypes.VALIDATOR_PICTURE:
      return `${data.nextValidator.name} changed their profile picture on ${networkTitle}`
    case eventTypes.VALIDATOR_STATUS:
      return `${data.nextValidator.name} had a status change from ${data.prevValidator.status} to ${data.nextValidator.status} on ${networkTitle}`
    case eventTypes.VALIDATOR_WEBSITE:
      return `${data.nextValidator.name} updated their website to: ${data.nextValidator.website} on ${networkTitle}`
    case eventTypes.VALIDATOR_ADDED:
      return `New validator ${data.nextValidator.name} just became an active validator on ${networkTitle}`

    case eventTypes.LUNIE_UPDATE:
      return data.title
    case eventTypes.SLASH:
      return `${data.operatorAddress} got slashed ${data.amount.amount} ${data.amount.denom}s on ${networkTitle}.`
    case eventTypes.LIVENESS:
      return `${data.operatorAddress} was offline for ${data.blocks} blocks on ${networkTitle}.`
    default:
      return 'Check it out! 👋'
  }
}

function findNetworkTitle(networks, networkId) {
  const network = networks.find((network) => network.id === networkId)
  return network.title
}

function findNetworkSlug(networks, networkId) {
  const network = networks.find((network) => network.id === networkId)
  return network.slug
}

function getPushLink(
  networks,
  { resourceType, eventType, networkId, resourceId, data, properties }
) {
  const resource =
    resourceType === resourceTypes.VALIDATOR ? eventType : resourceType
  const notificationData = properties || JSON.parse(data)

  switch (resource) {
    case resourceTypes.TRANSACTION:
      return `/${findNetworkSlug(networks, networkId)}/transactions`
    case resourceTypes.PROPOSAL:
      return `/${findNetworkSlug(networks, networkId)}/proposals/${resourceId}`
    case eventTypes.VALIDATOR_WEBSITE:
      return notificationData.nextValidator.website
    case eventTypes.VALIDATOR_COMMISSION:
    case eventTypes.VALIDATOR_VOTING_POWER_INCREASE:
    case eventTypes.VALIDATOR_VOTING_POWER_DECREASE:
    case eventTypes.VALIDATOR_DESCRIPTION:
    case eventTypes.VALIDATOR_PICTURE:
    case eventTypes.VALIDATOR_STATUS:
    case eventTypes.VALIDATOR_MAX_CHANGE_COMMISSION:
    case eventTypes.VALIDATOR_ADDED:
    case eventTypes.SLASH:
    case eventTypes.LIVENESS:
      return `/${findNetworkSlug(networks, networkId)}/validators/${resourceId}`

    // ResourceId field contains link property
    case resourceTypes.LUNIE:
      return resourceId || `/`
    default:
      return `/`
  }
}

// Get relevant icon for notification
// TODO: Upload icons to DO instead of passing relative links
function getIcon({ eventType, data, properties }) {
  const notificationData = properties || JSON.parse(data)
  switch (eventType) {
    case eventTypes.TRANSACTION_RECEIVE:
      return `/img/icons/activity/Received.svg`
    case eventTypes.TRANSACTION_SEND:
      return `/img/icons/activity/Sent.svg`
    case eventTypes.PROPOSAL_CREATE:
    case eventTypes.PROPOSAL_UPDATE:
      return `/img/icons/activity/Submitted.svg`
    case eventTypes.VALIDATOR_ADDED:
      return `/img/networks/${notificationData.nextValidator.networkId}.png`
    case eventTypes.VALIDATOR_WEBSITE:
    case eventTypes.VALIDATOR_COMMISSION:
    case eventTypes.VALIDATOR_VOTING_POWER_INCREASE:
    case eventTypes.VALIDATOR_VOTING_POWER_DECREASE:
    case eventTypes.VALIDATOR_DESCRIPTION:
    case eventTypes.VALIDATOR_PICTURE:
    case eventTypes.VALIDATOR_STATUS:
    case eventTypes.VALIDATOR_MAX_CHANGE_COMMISSION:
    case eventTypes.SLASH:
    case eventTypes.LIVENESS:
      // Picture field for validator type can be null
      return `${
        notificationData.nextValidator.picture ||
        `/img/icons/currencies/lunie.png`
      }`
    case eventTypes.LUNIE_UPDATE:
      return `/img/icons/currencies/lunie.png`
    default:
      return `/img/icons/currencies/lunie.png`
  }
}

// Topics creation method
// i.e. block_cosmos-hub-mainnet or cosmos1aswiocxzoqoidio_transaction_cosmos-hub-mainnet
function getTopic({ resourceType, networkId, eventType, resourceId }) {
  let data = [resourceId, eventType, networkId]

  if (eventType === eventTypes.LUNIE_UPDATE) return eventType

  if (
    resourceType === resourceTypes.PROPOSAL ||
    eventType === eventTypes.VALIDATOR_ADDED
  )
    data = [eventType, networkId]

  return data.filter((x) => !!x).join('_')
}

const startNotificationService = (networks) => {
  // Disable for development mode
  // (only activate for staging/production to avoid duplicate notifications)
  if (config.env !== 'development') {
    // listens on the graphQL subscription for events
    eventSubscription(async (event) => {
      if (event.properties.type === 'UnknownTx') return

      // hack to not spam users on every liveness failure
      // need to figure out how to handle this
      if (event.eventType === eventTypes.LIVENESS) return

      const topic = getTopic(event)
      const insertedNotifications = await database(config)('').storeNotification({
        topic,
        eventType: event.eventType,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        networkId: event.networkId,
        data: event.properties
      })

      const notificationResponse = insertedNotifications[0]
      try {
        const notification = {
          id: notificationResponse.id,
          networkId: event.networkId,
          timestamp: notificationResponse.created_at,
          title: getMessageTitle(networks, notificationResponse),
          link: getPushLink(networks, notificationResponse),
          icon: getIcon(notificationResponse)
        }
        publishNotificationAdded(notification, topic)
      } catch (error) {
        console.error(error, notificationResponse)
        Sentry.withScope(function (scope) {
          scope.setExtra('notificationResponse', notificationResponse)
          Sentry.captureException(error)
        })
      }
    })
  }
}

// Resolver for retrieving notifications
const getNotifications = (networks) => async (
  _,
  { timestamp = '', addressObjects },
  { dataSources, user: { uid } }
) => {
  // if user is not signed in, he is not allowed to receive notifications
  if (!uid) return []

  if (timestamp === '') timestamp = new Date().toISOString()

  if (!isISODate(timestamp))
    throw new UserInputError(
      `Timestamp ${timestamp} does not match ISO8601 format`
    )

  if (addressObjects.length === 0) return { notifications: [] }

  const defaultSubscriptions = await getDefaultSubscriptions(
    addressObjects,
    dataSources
  )
  const relevantNotifications = await database(config)('').getNotifications(
    defaultSubscriptions,
    timestamp
  )

  const notifications = relevantNotifications
    .filter(({ eventType }) => eventType !== eventTypes.VALIDATOR_ADDED)
    .map((notification) => ({
      id: notification.id, // used for correctly handling cache in Apollo
      networkId: notification.networkId, // used for filtering per network
      timestamp: notification.created_at, // used for grouping / sorting
      title: getMessageTitle(networks, notification), // title of notification
      link: getPushLink(networks, notification), // link for click-through action
      icon: getIcon(notification) // icon link
    }))

  return notifications
}

const isISODate = (dateString) => {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(dateString))
    return false
  const date = new Date(dateString)
  return date.toISOString() === dateString
}

module.exports = {
  startNotificationService,
  getTopic,
  getPushLink,
  getMessageTitle,
  getNotifications
}
