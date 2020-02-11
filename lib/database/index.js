const { insert, read } = require('./helpers')
const { getValidatorsInfo, getMaintenance } = require('./methods')

function database({ hasura_url, hasura_admin_key }) {
  return schema => {
    const methods = {
      insert: insert({ hasura_url, hasura_admin_key })(schema),
      upsert: insert({ hasura_url, hasura_admin_key }, true)(schema),
      read: read({ hasura_url, hasura_admin_key })(schema),
      getValidatorsInfo: getValidatorsInfo({ hasura_url, hasura_admin_key })(
        schema
      ),
      getValidatorInfoByAddress: getValidatorsInfo({
        hasura_url,
        hasura_admin_key
      })(schema),
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
