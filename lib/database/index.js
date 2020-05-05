const { insert, read, query } = require('./helpers')
const {
  getValidatorsInfo,
  getMaintenance,
  getTopicsforToken,
  storeStatistics,
  storePushTopics
} = require('./methods')

function database({ hasura_url, hasura_admin_key }) {
  return schema => {
    const methods = {
      insert: insert({ hasura_url, hasura_admin_key })(schema),
      upsert: insert({ hasura_url, hasura_admin_key }, true)(schema),
      read: read({ hasura_url, hasura_admin_key })(schema),
      query: query({ hasura_url, hasura_admin_key }),
      getValidatorsInfo: getValidatorsInfo({ hasura_url, hasura_admin_key })(
        schema
      ),
      getValidatorInfoByAddress: async validatorId => {
        const validatorInfo = await getValidatorsInfo({
          hasura_url,
          hasura_admin_key
        })(schema)(validatorId)
        return validatorInfo[0]
      },
      storeStatistics: storeStatistics({ hasura_url, hasura_admin_key })(
        schema
      ),
      storePushTopics: storePushTopics({ hasura_url, hasura_admin_key })(
        schema
      ),
      getMaintenance: getMaintenance({
        hasura_url,
        hasura_admin_key
      })(schema),
      getTopicsforToken: getTopicsforToken({
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
