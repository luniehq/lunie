const { insert, read } = require('./helpers')
const {
  getValidatorsInfo,
  getMaintenance,
  storeStatistics
} = require('./methods')

function database({ hasura_url, hasura_admin_key }) {
  return schema => {
    const methods = {
      insert: insert({ hasura_url, hasura_admin_key })(schema),
      upsert: insert({ hasura_url, hasura_admin_key }, true)(schema),
      read: read({ hasura_url, hasura_admin_key })(schema),
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
      getMaintenance: getMaintenance({
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
