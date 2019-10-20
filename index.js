const { ApolloServer } = require('apollo-server')
const typeDefs = require('./lib/schema')
const resolvers = require('./lib/resolvers')
const CosmosHubAPI = require('./lib/gaiav0-source')
const GaiaTestnetAPI = require('./lib/gaiav2-source')
const LunieDBAPI = require('./lib/luniedb-source')
const { networks } = require('./data/networks')
const config = require('./config')

const cosmosHubApi = new CosmosHubAPI(networks['cosmoshub'])
const gaiaTestnetApi = new GaiaTestnetAPI(networks['gaia-testnet'])
const lunieDBAPI = new LunieDBAPI()

const dataSources = {
  CosmosAPI: cosmosHubApi,
  GaiaAPI: gaiaTestnetApi,
  LunieDBAPI: lunieDBAPI
}
if (config.enableTestnet) {
  const testnetAPI = new CosmosHubAPI(networks['testnet'])
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
