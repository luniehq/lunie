const { read, insert } = require('./helpers')

const getValidatorsInfo = ({
  hasura_url,
  hasura_admin_key
}) => schema => async validatorId => {
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

const getTopicsforToken = ({
  hasura_url,
  hasura_admin_key
}) => schema => async token => {
  return await read({
    hasura_url,
    hasura_admin_key
  })(schema)(
    `pushTopics`,
    `pushTopics`,
    ['topics', 'token'],
    token ? `where: {token: {_eq: "${token}"}}` : false
  )
}

const storeStatistics = ({
  hasura_url,
  hasura_admin_key
}) => schema => async payload => {
  return await insert({
    hasura_url,
    hasura_admin_key
  })(schema)(`statistics`, payload)
}

const storePushTopics = ({ hasura_url, hasura_admin_key }) => schema => async (
  payload,
  upsert = false
) => {
  return await insert(
    {
      hasura_url,
      hasura_admin_key
    },
    upsert
  )(schema)(`pushTopics`, payload, undefined, undefined, ['topics', 'token'])
}

const getMaintenance = ({
  hasura_url,
  hasura_admin_key
}) => schema => async () => {
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
  getTopicsforToken,
  storeStatistics,
  storePushTopics
}
