const { ApolloServer } = require('apollo-server-express')
const responseCachePlugin = require('apollo-server-plugin-response-cache')
const { mapValues } = require('lodash')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')

const CosmosNodeSubscription = require('./cosmos-node-subscription')
const CosmosV0API = require('./cosmosV0-source')
const CosmosV2API = require('./cosmosV2-source')
const LunieDBAPI = require('./luniedb-source')
const BlockStore = require('./block-store')

const { networks } = require('../data/network-configs')
const config = require('../config')

const store = mapValues(networks, network => new BlockStore(network.id))

new CosmosNodeSubscription(
  networks['cosmos-hub-mainnet'],
  CosmosV0API,
  store['cosmos-hub-mainnet']
)
new CosmosNodeSubscription(
  networks['cosmos-hub-testnet'],
  CosmosV2API,
  store['cosmos-hub-testnet']
)

if (config.enableTestnet) {
  new CosmosNodeSubscription(
    networks['local-cosmos-hub-testnet'],
    CosmosV0API,
    store['local-cosmos-hub-testnet']
  )
}

function createDataSources() {
  const dataSources = {
    CosmosHubMainnetAPI: new CosmosV0API(networks['cosmos-hub-mainnet']),
    CosmosHubTestnetAPI: new CosmosV2API(networks['cosmos-hub-testnet']),
    LunieDBAPI: new LunieDBAPI(),
    store: store
  }
  if (config.enableTestnet) {
    dataSources.TestnetAPI = new CosmosV0API(
      networks['local-cosmos-hub-testnet']
    )
  }
  return dataSources
}

function createApolloServer() {
  let options = {
    typeDefs,
    resolvers,
    dataSources: createDataSources,
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
    options.cache = require('./lib/redis').createCache()
  }
  const apolloServer = new ApolloServer(options)
  return apolloServer
}

module.exports = {
  createApolloServer
}
