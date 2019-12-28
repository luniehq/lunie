const { ApolloServer } = require('apollo-server-express')
const responseCachePlugin = require('apollo-server-plugin-response-cache')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')

const { networkList } = require('./networks')
const NetworkContainer = require('./network-container')

const LunieDBAPI = require('./source/luniedb-source')
const config = require('../config')

const networks = networkList.map(network => new NetworkContainer(network))

function getDataSources(networks) {
  const sources = {}
  networks.forEach(network => {
    sources[network.id] = network.createDataSource()
  })

  return () => {
    return {
      ...sources,
      LunieDBAPI: new LunieDBAPI()
    }
  }
}

function startBlockTriggers() {
  networks.map(network => network.initialize())
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
    }
  }

  if (config.enable_cache) {
    options.cache = require('./redis').createCache()
  }
  const apolloServer = new ApolloServer(options)
  apolloServer.installSubscriptionHandlers(httpServer)

  return apolloServer
}

module.exports = {
  createApolloServer
}
