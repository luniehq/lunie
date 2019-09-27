var url = require("url");
const { ApolloServer } = require("apollo-server");
const { RedisCache } = require("apollo-server-cache-redis");
const typeDefs = require("./lib/schema");
const resolvers = require("./lib/resolvers");
const CosmosAPI = require("./lib/cosmos-source");
const networkData = require("./data/networks");

let options = {
  typeDefs,
  resolvers,
  dataSources: () => ({
    cosmosAPI: new CosmosAPI(),
    networkData
  }),
  introspection: true,
  playground: true
};

let redis_uri;
if (process.env.NODE_ENV === "development") {
  redis_uri = {
    hostname: `localhost`,
    port: 6379
  };
} else {
  redis_uri = url.parse(process.env.REDIS_URL || "");
}

if (process.env.ENABLE_CACHE) {
  options.cache = new RedisCache({
    host: redis_uri.hostname,
    port: redis_uri.port
  });
}

const server = new ApolloServer(options);

server
  .listen({ port: process.env.PORT || 4000 })
  .then(({ url }) => `GraphQL Server listening on ${url}`)
  .then(console.log)
  .catch(console.error);
