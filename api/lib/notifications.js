const { UserInputError } = require('apollo-server')
const Sentry = require('@sentry/node')
const {
  eventSubscription,
  publishNotificationAdded
} = require('./subscriptions')
const {
  eventTypes,
  resourceTypes,
  getDefaultSubscriptions
} = require('./notifications-types')
const database = require('./database')
const config = require('../config.js')

function getMessageTitle(networks, notification) {
  const data = JSON.parse(notification.data)
  switch (notification.eventType) {
    case eventTypes.TRANSACTION_RECEIVE:
      return `You have received ${data.details.amount.amount} ${
        data.details.amount.denom
      }${data.details.amount.amount !== 1 ? 's' : ''} on ${findNetworkTitle(
        networks,
        notification.networkId
      )}`
    case eventTypes.TRANSACTION_SEND:
      return `You sent ${data.details.amount.amount} ${
        data.details.amount.denom
      }${data.details.amount.amount !== 1 ? 's' : ''} on ${findNetworkTitle(
        networks,
        notification.networkId
      )}`
    case eventTypes.PROPOSAL_CREATE:
      return `New proposal created for ${findNetworkTitle(
        networks,
        notification.networkId
      )}: '${data.title}'`
    case eventTypes.PROPOSAL_UPDATE:
      return `Proposal status changed to '${data.status}' on ${findNetworkTitle(
        networks,
        notification.networkId
      )} for ${data.title}`

    /* validator changes */
    case eventTypes.VALIDATOR_COMMISSION:
      return `Commission change for ${notification.resourceId} from ${data.prevValidator.commission} to ${data.nextValidator.commission}`

    case eventTypes.VALIDATOR_VOTING_POWER_INCREASE: {
      const prevVotingPower = Number(data.prevValidator.votingPower)
      const nextVotingPower = Number(data.nextValidator.votingPower)
      const percentageDifference =
        (100 * (nextVotingPower - prevVotingPower)) /
        ((nextVotingPower + prevVotingPower) / 2)

      return `Voting power increased from ${Number(
        data.prevValidator.votingPower
      ).toFixed(6)} to ${Number(data.nextValidator.votingPower).toFixed(
        6
      )} (${percentageDifference.toFixed(3)}% increase) for ${
        data.nextValidator.name
      }`
    }

    case eventTypes.VALIDATOR_VOTING_POWER_DECREASE: {
      const prevVotingPower = Number(data.prevValidator.votingPower)
      const nextVotingPower = Number(data.nextValidator.votingPower)
      const percentageDifference =
        (100 * (nextVotingPower - prevVotingPower)) /
        ((nextVotingPower + prevVotingPower) / 2)

      return `Voting power decreased from ${Number(
        data.prevValidator.votingPower
      ).toFixed(6)} to ${Number(data.nextValidator.votingPower).toFixed(
        6
      )} (${percentageDifference.toFixed(3)}% decrease) for ${
        data.nextValidator.name
      }`
    }

    case eventTypes.VALIDATOR_MAX_CHANGE_COMMISSION:
      return `Max change for commisions has been updated from ${Number(
        data.prevValidator.maxChangeCommission
      ).toFixed(3)} to ${Number(data.nextValidator.maxChangeCommission).toFixed(
        3
      )}`
    case eventTypes.VALIDATOR_DESCRIPTION:
      return `Validator description changed for ${data.nextValidator.name}, click to find out!`
    case eventTypes.VALIDATOR_PICTURE:
      return `Validator picture changed for ${data.nextValidator.name}, click to find out!`
    case eventTypes.VALIDATOR_STATUS:
      return `Validator status changed for ${data.nextValidator.name} from ${data.prevValidator.status} to ${data.nextValidator.status}`
    case eventTypes.VALIDATOR_WEBSITE:
      return `Validator ${data.nextValidator.name} updated its website to: ${data.nextValidator.website}`
    case eventTypes.VALIDATOR_ADDED:
      return `New validator ${
        data.nextValidator.name
      } entered the validator list on ${findNetworkTitle(
        networks,
        notification.networkId
      )}`

    case eventTypes.LUNIE_UPDATE:
      return data.title
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
  { resourceType, eventType, networkId, resourceId, data }
) {
  const resource =
    resourceType === resourceTypes.VALIDATOR ? eventType : resourceType
  const notificationData = JSON.parse(data)

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
function getIcon({ eventType, data }) {
  const notificationData = JSON.parse(
    data
  )
  switch (eventType) {
    case eventTypes.TRANSACTION_RECEIVE:
      return `/img/icons/activity/Received.svg`
    case eventTypes.TRANSACTION_SEND:
      return `/img/icons/activity/Sent.svg`
    case eventTypes.PROPOSAL_CREATE:
    case eventTypes.PROPOSAL_UPDATE:
      return `/img/icons/activity/Submitted.svg`
    case eventTypes.VALIDATOR_WEBSITE:
    case eventTypes.VALIDATOR_COMMISSION:
    case eventTypes.VALIDATOR_VOTING_POWER_INCREASE:
    case eventTypes.VALIDATOR_VOTING_POWER_DECREASE:
    case eventTypes.VALIDATOR_DESCRIPTION:
    case eventTypes.VALIDATOR_PICTURE:
    case eventTypes.VALIDATOR_STATUS:
    case eventTypes.VALIDATOR_MAX_CHANGE_COMMISSION:
    case eventTypes.VALIDATOR_ADDED:
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

      const topic = getTopic(event)
      const response = await database(config)('').storeNotification({
        topic,
        eventType: event.eventType,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        networkId: event.networkId,
        data: event.properties
      })

      const notificationResponse =
        response.data.insert_notifications.returning[0]
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
  { dataSources }
) => {
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

  const notifications = relevantNotifications.map((notification) => ({
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
