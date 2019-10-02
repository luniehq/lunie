require("dotenv").config();

const { ApolloServer } = require("apollo-server");
const typeDefs = require("./lib/schema");
const resolvers = require("./lib/resolvers");
const CosmosAPI = require("./lib/cosmos-source");
const networkData = require("./data/networks");
const config = require("./config");

try {
  new URL(config.chain_url);
  new URL(config.chain_ws_url);
} catch (e) {
  console.log("CHAIN_URL and CHAIN_URL_WS are required environment variables");
  process.exit(1);
}

let options = {
  typeDefs,
  resolvers,
  dataSources: () => ({
    cosmosAPI: new CosmosAPI(config.chain_url),
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
