require("dotenv").config();
var url = require("url");

const { ApolloServer } = require("apollo-server");
const typeDefs = require("./lib/schema");
const resolvers = require("./lib/resolvers");
const CosmosAPI = require("./lib/cosmos-source");
const networkData = require("./data/networks");

let options = {
  typeDefs,
  resolvers,
  dataSources: () => ({
    cosmosAPI: new CosmosAPI(process.env.CHAIN_URL || "https://lcd.nylira.net"),
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
  .then(({ url }) => `GraphQL Server listening on ${url}`)
  .then(console.log)
  .catch(console.error);
