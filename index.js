require("dotenv").config();

const { ApolloServer } = require("apollo-server");
const typeDefs = require("./lib/schema");
const resolvers = require("./lib/resolvers");
const CosmosAPI = require("./lib/cosmos-source");
const networkData = require("./data/networks");

try {
  new URL(process.env.CHAIN_URL);
  new URL(process.env.CHAIN_URL_W);
} catch (e) {
  console.log("CHAIN_URL and CHAIN_URL_WS are required environment variables");
  process.exit(1);
}

let options = {
  typeDefs,
  resolvers,
  dataSources: () => ({
    cosmosAPI: new CosmosAPI(process.env.CHAIN_URL),
    networkData
  }),
  cacheControl: {
    defaultMaxAge: 5000
  },
  introspection: true,
  playground: true,
  engine: {
    apiKey: process.env.ENGINE_API_KEY,
    schemaTag: "production"
  }
};

if (process.env.ENABLE_CACHE) {
  options.cache = require("./lib/redis").createCache();
}

const server = new ApolloServer(options);

server
  .listen({ port: process.env.PORT || 4000 })
  .then(({ url, subscriptionsUrl }) => {
    console.log(`Server ready at ${url}`);
    console.log(`Subscriptions ready at ${subscriptionsUrl}`);
  })
  .catch(console.error);
