const { ApolloServer } = require('apollo-server')
const typeDefs = require('./lib/schema')
const resolvers = require('./lib/resolvers')
const CosmosV0API = require('./lib/cosmosV0-source')
const CosmosV2API = require('./lib/cosmosV2-source')
const LunieDBAPI = require('./lib/luniedb-source')
const { networks } = require('./data/networks')
const config = require('./config')

const cosmosHubMainnetAPI = new CosmosV0API(networks['cosmoshub'])
const cosmosHubTestnetAPI = new CosmosV2API(networks['gaia-testnet'])
const lunieDBAPI = new LunieDBAPI()

const dataSources = {
  CosmosAPI: cosmosHubMainnetAPI,
  GaiaAPI: cosmosHubTestnetAPI,
  LunieDBAPI: lunieDBAPI
}
if (config.enableTestnet) {
  const testnetAPI = new CosmosV0API(networks['testnet'])
  dataSources.TestnetAPI = testnetAPI
}

let options = {
  typeDefs,
  resolvers,
  dataSources: () => dataSources,
  cacheControl: {
    defaultMaxAge: 5000
  },
  introspection: true,
  playground: true,
  engine: {
    apiKey: config.apollo_engine_api_key,
    schemaTag: 'production'
  }
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
