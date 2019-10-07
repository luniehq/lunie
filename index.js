const { ApolloServer } = require("apollo-server");
const typeDefs = require("./lib/schema");
const resolvers = require("./lib/resolvers");
const CosmosAPI = require("./lib/cosmos-source");
const GaiaAPI = require("./lib/gaia-source");
const networkData = require("./data/networks");
const config = require("./config");

// try {
//   for (network in networkData.getNetworks()) {
//     console.log(network);
//     new URL(network.api_url);
//     new URL(network.rpc_url);
//   }
// } catch (e) {
//   console.log("CHAIN_URL and CHAIN_URL_WS are required environment variables");
//   process.exit(1);
// }

const cosmosApi = new CosmosAPI(networkData.getNetworks()[1]);
const gaiaApi = new GaiaAPI(networkData.getNetworks()[0]);

let options = {
  typeDefs,
  resolvers,
  dataSources: () => ({
    CosmosAPI: cosmosApi,
    GaiaAPI: gaiaApi,
    networkData
  }),
  cacheControl: {
    defaultMaxAge: 5000
  },
  introspection: true,
  playground: true,
  engine: {
    apiKey: config.apollo_engine_api_key,
    schemaTag: "production"
  }
};

if (config.enable_cache) {
  options.cache = require("./lib/redis").createCache();
}

const server = new ApolloServer(options);

server
  .listen({ port: config.port })
  .then(({ url, subscriptionsUrl }) => {
    console.log(`Server ready at ${url}`);
    console.log(`Subscriptions ready at ${subscriptionsUrl}`);
  })
  .catch(console.error);
