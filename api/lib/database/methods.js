const { read, insert } = require('./helpers')

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

module.exports = {
  incrementValidatorViews,
  getValidatorsViews,
  getValidatorsInfo,
  getMaintenance,
  storeStatistics,
  storeNotification,
  getNotifications,
  storeUser,
  getUser
}
