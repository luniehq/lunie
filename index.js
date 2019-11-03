const { ApolloServer } = require('apollo-server')
const responseCachePlugin = require('apollo-server-plugin-response-cache')
const typeDefs = require('./lib/schema')
const resolvers = require('./lib/resolvers')
const CosmosNodeSubscription = require('./lib/cosmos-node-subscription')
const CosmosV0API = require('./lib/cosmosV0-source')
const CosmosV2API = require('./lib/cosmosV2-source')
const LunieDBAPI = require('./lib/luniedb-source')
const { networks } = require('./data/network-configs')
const config = require('./config')

new CosmosNodeSubscription(networks['cosmos-hub-mainnet'], CosmosV0API)
new CosmosNodeSubscription(networks['cosmos-hub-testnet'], CosmosV2API)

if (config.enableTestnet) {
  new CosmosNodeSubscription(networks['local-cosmos-hub-testnet'], CosmosV0API)
}

function createDataSources() {
  const dataSources = {
    CosmosHubMainnetAPI: new CosmosV0API(networks['cosmos-hub-mainnet']),
    CosmosHubTestnetAPI: new CosmosV2API(networks['cosmos-hub-testnet']),
    LunieDBAPI: new LunieDBAPI()
  }
  if (config.enableTestnet) {
    dataSources.TestnetAPI = new CosmosV0API(
      networks['local-cosmos-hub-testnet']
    )
  }
  return dataSources
}

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
  plugins: [responseCachePlugin()]
}

if (config.enable_cache) {
  options.cache = require('./lib/redis').createCache()
}

const server = new ApolloServer(options)

server
  .listen({ port: config.port })
  .then(({ url, subscriptionsUrl }) => {
    console.log(`Server ready at ${url}`)
    console.log(`Subscriptions ready at ${subscriptionsUrl}`)
  })
  .catch(console.error)
