const { ApolloServer } = require("apollo-server");
const { RedisCache } = require("apollo-server-cache-redis");
const typeDefs = require("./lib/schema");
const resolvers = require("./lib/resolvers");
const CosmosAPI = require("./lib/cosmos-source");
const networkData = require("./data/networks");

const redisHost = process.env.REDIS_URL || "localhost";
console.log("redis", process.env.REDIS_URL, redisHost);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    cosmosAPI: new CosmosAPI(),
    networkData
  }),
  cache: new RedisCache({
    host: redisHost
  }),
  introspection: true,
  playground: true
});

server
  .listen({ port: process.env.PORT || 4000 })
  .then(({ url }) => `GraphQL Server listening on ${url}`)
  .then(console.log)
  .catch(console.error);
