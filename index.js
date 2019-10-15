const { ApolloServer } = require('apollo-server')
const typeDefs = require('./lib/schema')
const resolvers = require('./lib/resolvers')
const CosmosAPI = require('./lib/cosmos-source')
const GaiaAPI = require('./lib/gaia-source')
const LunieDBAPI = require('./lib/luniedb-source')
const { networks } = require('./data/networks')
const config = require('./config')

const cosmosApi = new CosmosAPI(networks['cosmoshub'])
const gaiaApi = new GaiaAPI(networks['gaia-testnet'])
const lunieDBAPI = new LunieDBAPI()

const dataSources = {
  CosmosAPI: cosmosApi,
  GaiaAPI: gaiaApi,
  LunieDBAPI: lunieDBAPI,
  networks
}
if (config.enableTestnet) {
  const testnetAPI = new CosmosAPI(networks['testnet'])
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
