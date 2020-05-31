const { ApolloServer } = require('apollo-server-express')
const responseCachePlugin = require('apollo-server-plugin-response-cache')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const Notifications = require('./notifications')

const { networkList } = require('./networks')
const NetworkContainer = require('./network-container')

const config = require('../config')

const networks = networkList.map((network) => new NetworkContainer(network))

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

function startBlockTriggers() {
  networks.map((network) => network.initialize())
}

function createApolloServer(httpServer) {
  if (config.env !== 'test') {
    startBlockTriggers()
  }

  let options = {
    typeDefs,
    resolvers,
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
    context: ({ req, connection }) => {
      if (connection) {
        return {
          dataSources: getDataSources(networks)
        }
      }
      if (req) {
        return {
          fingerprint: req.headers.fingerprint,
          development: req.headers.development
        }
      }
    }
  }

  if (config.enable_cache) {
    options.cache = require('./redis').createCache()
  }
  const apolloServer = new ApolloServer(options)
  apolloServer.installSubscriptionHandlers(httpServer)

  Notifications.startNotificationService()

  return apolloServer
}

module.exports = {
  createApolloServer
}
