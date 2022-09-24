const { ApolloServer } = require('apollo-server-express')
const responseCachePlugin = require('apollo-server-plugin-response-cache')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const Notifications = require('./notifications/notifications')
const database = require('./database')
const { validateSession } = require('./accounts')

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

async function createApolloServer(httpServer) {
  const networkList = await db.getNetworks()
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

        const sessionToken = req.headers.authorization
        let session
        if (sessionToken) {
          session = await validateSession(sessionToken) // throws if session is outdated
        }
        return {
          fingerprint: req.headers.fingerprint,
          development: req.headers.development,
          user: session
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
