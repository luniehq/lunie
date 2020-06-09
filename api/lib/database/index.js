const { insert, insertWithoutPrefix, read, query } = require('./helpers')
const {
  getValidatorsInfo,
  getMaintenance,
  storeNetwork,
  getNetworkId,
  storeStatistics,
  storeNotification,
  getNotifications,
  incrementValidatorViews
} = require('./methods')

function database({ hasura_url, hasura_admin_key }) {
  return (schema) => {
    const methods = {
      insert: insert({ hasura_url, hasura_admin_key })(schema),
      insertWithoutPrefix: insertWithoutPrefix({
        hasura_url,
        hasura_admin_key
      })(schema),
      upsert: insert({ hasura_url, hasura_admin_key }, true)(schema),
      read: read({ hasura_url, hasura_admin_key })(schema),
      query: query({ hasura_url, hasura_admin_key }),
      getValidatorsInfo: getValidatorsInfo({ hasura_url, hasura_admin_key })(
        schema
      ),
      getNotifications: getNotifications({ hasura_url, hasura_admin_key })(
        schema
      ),
      getValidatorInfoByAddress: async (validatorId) => {
        const validatorInfo = await getValidatorsInfo({
          hasura_url,
          hasura_admin_key
        })(schema)(validatorId)
        return validatorInfo[0]
      },
      getNetworkId: getNetworkId({ hasura_url, hasura_admin_key })(schema),
      storeNetwork: storeNetwork({ hasura_url, hasura_admin_key })(schema),
      storeStatistics: storeStatistics({ hasura_url, hasura_admin_key })(
        schema
      ),
      storeNotification: storeNotification({ hasura_url, hasura_admin_key })(
        schema
      ),
      getMaintenance: getMaintenance({
        hasura_url,
        hasura_admin_key
      })(schema),
      incrementValidatorViews: incrementValidatorViews({
        hasura_url,
        hasura_admin_key
      })(schema)
    }

    return {
      ...methods
    }
  }
}

module.exports = database
