const { insert, read, query } = require('./helpers')
const {
  getValidatorsInfo,
  getMaintenance,
  storeNetwork,
  getNetwork,
  getNetworks,
  getNetworkLinks,
  storeStatistics,
  storeNotification,
  getNotifications,
  incrementValidatorViews,
  getValidatorsViews,
  storeUser,
  getUser,
  storeStore,
  getStore,
  storeNotificationRegistrations,
  getNotificationRegistrations,
  storeAndGetNewSession,
  getSession
} = require('./methods')

function database(dbConfig) {
  return (schema) => {
    const methods = {
      insert: insert(dbConfig)(schema),
      upsert: insert(dbConfig, true)(schema),
      read: read(dbConfig)(schema),
      query: query(dbConfig),
      getValidatorsInfo: getValidatorsInfo(dbConfig)(schema),
      getNotifications: getNotifications(dbConfig)(schema),
      getValidatorInfoByAddress: async (validatorId) => {
        const validatorInfo = await getValidatorsInfo(dbConfig)(schema)(
          validatorId
        )
        return validatorInfo[0]
      },
      getNetwork: getNetwork(dbConfig)(schema),
      getNetworks: getNetworks(dbConfig)(schema),
      getNetworkLinks: getNetworkLinks(dbConfig)(schema),
      storeNetwork: storeNetwork(dbConfig)(schema),
      storeStatistics: storeStatistics(dbConfig)(schema),
      storeNotification: storeNotification(dbConfig)(schema),
      getMaintenance: getMaintenance(dbConfig)(schema),
      incrementValidatorViews: incrementValidatorViews(dbConfig)(schema),
      getValidatorsViews: getValidatorsViews(dbConfig)(schema),
      storeUser: storeUser(dbConfig)(schema),
      getUser: getUser(dbConfig)(schema),
      getSession: getSession(dbConfig)(schema),
      storeAndGetNewSession: storeAndGetNewSession(dbConfig)(schema),
      storeStore: storeStore(dbConfig)(schema),
      getStore: getStore(dbConfig)(schema),
      storeNotificationRegistrations: storeNotificationRegistrations(dbConfig)(
        schema
      ),
      getNotificationRegistrations: getNotificationRegistrations(dbConfig)(
        schema
      )
    }

    return {
      ...methods
    }
  }
}

module.exports = database
