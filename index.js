const { ApolloServer } = require("apollo-server")
const typeDefs = require("./schema")
const resolvers = require("./resolvers")
const ProposalAPI = require("./proposal")

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    proposalAPI: new ProposalAPI(),
  })
})

server
  .listen({ port: process.env.PORT || 4000 })
  .then(({ url }) => `GraphQL Server listening on ${url}`)
  .then(console.log)
  .catch(console.error)