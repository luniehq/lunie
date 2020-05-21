const { read, insert } = require('./helpers')

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
) => async (topics, limit = 10) => {
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
    `where: { topic: {_in: [${topics.map(
      (topic) => `"${topic}"`
    )}]}} limit: ${limit}, order_by: {created_at: desc}`
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
    'message',
    'show',
    'type'
  ])
}

module.exports = {
  getValidatorsInfo,
  getMaintenance,
  storeStatistics,
  storeNotification,
  getNotifications
}
