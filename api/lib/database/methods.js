const { read, insert, query } = require('./helpers')

const incrementValidatorViews = ({
  hasura_url,
  hasura_admin_key
}) => () => async (validatorId, networkId) => {
  const validatorPopularity = await read({
    hasura_url,
    hasura_admin_key
  })('')(
    `validatorPopularity`,
    `validatorPopularity`,
    ['requests'],
    `where: {operator_address: {_eq: "${validatorId}"}, networkId: {_eq: "${networkId}"}}`
  )

  let requests = 1
  if (validatorPopularity.length > 0) {
    // the read query only returns one validator, so we can safely pick the first validator of the list
    requests = validatorPopularity[0].requests + 1
  }

  await insert(
    {
      hasura_url,
      hasura_admin_key
    },
    true
  )('')(`validatorPopularity`, [
    {
      operator_address: validatorId,
      requests,
      networkId
    }
  ])
}

const getValidatorsViews = ({ hasura_url, hasura_admin_key }) => () => async (
  networkId
) => {
  const validatorPopularity = await read({
    hasura_url,
    hasura_admin_key
  })('')(
    `validatorPopularity`,
    `validatorPopularity`,
    ['operator_address', 'requests'],
    `where: { networkId: {_eq: "${networkId}"}}`
  )
  if (validatorPopularity.length > 0) {
    return validatorPopularity
  } else {
    return []
  }
}

const getValidatorsInfo = ({ hasura_url, hasura_admin_key }) => (
  schema
) => async (validatorId) => {
  return await read({
    hasura_url,
    hasura_admin_key
  })(schema)(
    `validatorprofiles`,
    `validatorprofiles`,
    ['operator_address', 'name', 'picture'],
    validatorId ? `where: {operator_address: {_eq: "${validatorId}"}}` : false
  )
}

const getNotifications = ({ hasura_url, hasura_admin_key }) => (
  schema
) => async (topics, timestamp) => {
  const limit = 20
  return await read({
    hasura_url,
    hasura_admin_key
  })(schema)(
    `notifications`,
    `notifications`,
    [
      'topic',
      'eventType',
      'resourceType',
      'resourceId',
      'networkId',
      'data',
      'id',
      'created_at'
    ],
    `where: { 
      topic: {_in: [${topics.map((topic) => `"${topic}"`)}]},
      created_at: {_lt: "${timestamp}"}
    } limit: ${limit}, order_by: {created_at: desc}`
  )
}

const getNetworks = ({ hasura_url, hasura_admin_key }) => () => async () => {
  const {
    data: { networks, networksCapabilities, coinLookups }
  } = await query({
    hasura_url,
    hasura_admin_key
  })(`
    query {
      networks: networks {
        id
        enabled
        experimental
        title
        chain_id
        rpc_url
        api_url
        bech32_prefix
        testnet
        default
        stakingDenom
        address_prefix
        address_creator
        ledger_app
        network_type
        source_class_name
        block_listener_class_name
        icon
        slug
        lockUpPeriod
        powered
        erasPerDay
        HDPaths
        curves
        defaultHDPath
        defaultCurve
      }
      networksCapabilities: networksCapabilities {
        id
        feature_session
        feature_explore
        feature_portfolio
        feature_validators
        feature_proposals 
        feature_activity
        feature_explorer
        action_send
        action_claim_rewards
        action_delegate
        action_redelegate
        action_undelegate
        action_deposit
        action_vote
        action_proposal
      }
      coinLookups: coinLookups {
        id
        chainDenom
        viewDenom
        chainToViewConversionFactor
      }
    }
  `)
  const allNetworks = networks.map((network) => ({
    ...network,
    ...networksCapabilities.find(({ id }) => id === network.id),
    coinLookup: coinLookups.filter(({ id }) => id === network.id)
  }))
  // if the RUN_ONLY_NETWORK env variable is set, we only run the especified network
  if (process.env.RUN_ONLY_NETWORKS) {
    return allNetworks.filter(({ id }) =>
      process.env.RUN_ONLY_NETWORKS.split(',').includes(id)
    )
  }
  return allNetworks
}

const getNetwork = ({ hasura_url, hasura_admin_key }) => () => async (id) => {
  const {
    data: { networks, networksCapabilities, coinLookups }
  } = await query({
    hasura_url,
    hasura_admin_key
  })(`
    query {
      networks: networks(where: { 
        id: {_eq: "${id}"}
      }) {
        id
        enabled
        experimental
        title
        chain_id
        rpc_url
        api_url
        bech32_prefix
        testnet
        default
        stakingDenom
        address_prefix
        address_creator
        ledger_app
        network_type
        source_class_name
        block_listener_class_name
        icon
        slug
        lockUpPeriod
        powered
        public_rpc_url
        erasPerDay
        HDPaths
        curves
        defaultHDPath
        defaultCurve
      }
      networksCapabilities: networksCapabilities(where: { 
        id: {_eq: "${id}"}
      }) {
        id
        feature_session
        feature_explore
        feature_portfolio
        feature_validators
        feature_proposals 
        feature_activity
        feature_explorer
        action_send
        action_claim_rewards
        action_delegate
        action_redelegate
        action_undelegate
        action_deposit
        action_vote
        action_proposal
      }
      coinLookups: coinLookups(where: { 
        id: {_eq: "${id}"}
      }) {
        id
        chainDenom
        viewDenom
        chainToViewConversionFactor
      }
    }
  `)
  const network = networks[0]
  return {
    ...network,
    ...networksCapabilities[0],
    coinLookup: coinLookups
  }
}

const storeCoinLookups = (
  hasura_url,
  hasura_admin_key,
  schema,
  coinLookups
) => {
  return Promise.all(
    coinLookups.map((coinLookup) => {
      return insert(
        {
          hasura_url,
          hasura_admin_key
        },
        true
      )(schema)(`coinLookups`, coinLookup)
    })
  )
}

const storeNetwork = ({ hasura_url, hasura_admin_key }) => (schema) => async (
  payload
) => {
  return (
    await insert(
      {
        hasura_url,
        hasura_admin_key
      },
      true
    )(schema)(`networks`, payload[`network`]),
    await storeCoinLookups(
      hasura_url,
      hasura_admin_key,
      schema,
      payload[`coinLookups`]
    ),
    await insert(
      {
        hasura_url,
        hasura_admin_key
      },
      true
    )(schema)(`networksCapabilities`, payload[`networksCapabilities`])
  )
}

const storeStatistics = ({ hasura_url, hasura_admin_key }) => (
  schema
) => async (payload) => {
  return await insert({
    hasura_url,
    hasura_admin_key
  })(schema)(`statistics`, payload)
}

const storeNotification = ({ hasura_url, hasura_admin_key }) => (
  schema
) => async (payload) => {
  return await insert({
    hasura_url,
    hasura_admin_key
  })(schema)(`notifications`, payload, undefined, undefined, [
    'topic',
    'eventType',
    'resourceType',
    'resourceId',
    'networkId',
    'data',
    'id',
    'created_at'
  ])
}

const storeNotificationRegistrations = ({ hasura_url, hasura_admin_key }) => (
  schema
) => async (payload) => {
  return await insert(
    {
      hasura_url,
      hasura_admin_key
    },
    true
  )(schema)(`notificationRegistrations`, payload, undefined, undefined, [
    'uid',
    'topic',
    'type'
  ])
}

const getNotificationRegistrations = ({ hasura_url, hasura_admin_key }) => (
  schema
) => async (payload) => {
  return await read({
    hasura_url,
    hasura_admin_key
  })(schema)(`notificationRegistrations`, `notificationRegistrations`, [
    'uid',
    'topic',
    'type'
  ])
}

const getMaintenance = ({ hasura_url, hasura_admin_key }) => (
  schema
) => async () => {
  return await read({
    hasura_url,
    hasura_admin_key
  })(schema)(`maintenance`, `validatorprofiles`, [
    'id',
    'link',
    'linkCaption',
    'message',
    'show',
    'type'
  ])
}

const storeUser = ({ hasura_url, hasura_admin_key }) => (schema) => async (
  payload
) => {
  return await insert({
    hasura_url,
    hasura_admin_key
  })(schema)(`users`, payload, undefined, undefined, ['uid'])
}

const getUser = ({ hasura_url, hasura_admin_key }) => (schema) => async (
  uid
) => {
  return await read({
    hasura_url,
    hasura_admin_key
  })(schema)(
    `users`,
    `users`,
    ['uid', 'email', 'premium', 'createdAt', 'lastActive'],
    `where: { uid: {_eq: "${uid}"} }`
  )
}

// write and return a new session
const storeAndGetNewSession = ({
  hasura_url,
  hasura_admin_key
}) => () => async (uid) => {
  const now = new Date()
  const validUntil = new Date()
  validUntil.setDate(now.getDate() + 21) // valid for 3 weeks
  const payload = {
    uid,
    valid_until: validUntil
  }
  const sessions = await insert({
    hasura_url,
    hasura_admin_key
  })('')(`sessions`, payload, undefined, undefined, [
    `session_token`,
    `valid_until`
  ])
  return sessions[0] // insert always returns an array
}

const getSession = ({ hasura_url, hasura_admin_key }) => () => async (
  sessionToken
) => {
  const response = await read({
    hasura_url,
    hasura_admin_key
  })('')(
    `sessions`,
    `sessions`,
    [`uid`, `valid_until`],
    `where: {
      session_token: { _eq: "${sessionToken}"}
    }`
  )
  return response ? response[0] : undefined
}

const storeStore = ({ hasura_url, hasura_admin_key }) => () => async (
  payload
) => {
  await insert(
    {
      hasura_url,
      hasura_admin_key
    },
    true
  )('')(`storeCaches`, payload, undefined, undefined, [`networkId`])
}

const getStore = ({ hasura_url, hasura_admin_key }) => () => async (id) => {
  const data = await read({
    hasura_url,
    hasura_admin_key
  })('')(
    `storeCaches`,
    `storeCaches`,
    ['networkId', 'store'],
    `where: { 
      networkId: {_eq: "${id}"}
    }`
  )
  return data[0]
}

module.exports = {
  incrementValidatorViews,
  getValidatorsViews,
  getValidatorsInfo,
  getMaintenance,
  storeStatistics,
  storeNotification,
  getNotifications,
  storeNetwork,
  getNetwork,
  getNetworks,
  storeUser,
  getUser,
  storeStore,
  getStore,
  storeNotificationRegistrations,
  getNotificationRegistrations,
  storeAndGetNewSession,
  getSession
}
