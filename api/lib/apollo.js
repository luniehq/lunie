const { ApolloServer } = require('apollo-server-express')
const responseCachePlugin = require('apollo-server-plugin-response-cache')
const Sentry = require('@sentry/node')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const Notifications = require('./notifications/notifications')
const database = require('./database')
const { validateIdToken } = require('./accounts')

const NetworkContainer = require('./network-container')

const config = require('../config')
const NotificationContoller = require('./notifications/notificationController')

const db = database(config)('')

function getDataSources(networks) {
  return () => {
    const sources = {}
    networks.forEach((network) => {
      sources[network.id] = network.createDataSource()
    })

    return {
      ...sources
    }
  }
}

function startBlockTriggers(networks) {
  networks.map((network) => network.initialize())
}

function getCoinLookup(network, denom, coinLookupDenomType = `chainDenom`) {
  return network.coinLookup.find((coin) => coin[coinLookupDenomType] === denom)
}

async function createApolloServer(httpServer) {
  const networksFromDBList = await db.getNetworks()
  const networkList = networksFromDBList
    .filter((network) => network.enabled)
    // add the getCoinLookup function
    .map((network) => {
      return {
        ...network,
        getCoinLookup
      }
    })
  const networks = networkList.map((network) => new NetworkContainer(network))

  if (config.env !== 'test') {
    startBlockTriggers(networks)
  }

  const notificationController = new NotificationContoller(networkList)

  let options = {
    typeDefs,
    resolvers: resolvers(networkList, notificationController),
    dataSources: getDataSources(networks),
    cacheControl: {
      defaultMaxAge: 10
    },
    introspection: true,
    playground: true,
    engine: {
      apiKey: config.apollo_engine_api_key,
      schemaTag: 'production'
    },
    plugins: [responseCachePlugin()],
    subscriptions: {
      path: config.subscriptionPath
    },
    context: async ({ req, connection }) => {
      if (connection) {
        return {
          dataSources: getDataSources(networks)
        }
      }
      if (req) {
        if (process.env.WHITELIST_ORIGIN) {
          const origin = req.get('origin')
          if (!process.env.WHITELIST_ORIGIN.split(',').includes(origin)) {
            throw new Error(`Access Forbidden`)
          }
        }
        const idToken = req.headers.authorization
        let user = {}
        if (idToken) {
          user = await validateIdToken(idToken)
        }
        return {
          fingerprint: req.headers.fingerprint,
          development: req.headers.development,
          user
        }
      }
    }
  }

  if (config.enable_cache) {
    options.cache = require('./redis').createCache()
  }
  const apolloServer = new ApolloServer(options)
  apolloServer.installSubscriptionHandlers(httpServer)

  Notifications.startNotificationService(networkList)

  return apolloServer
}

module.exports = { createApolloServer }
