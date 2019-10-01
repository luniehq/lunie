import Vue from "vue"
import { ApolloClient } from "apollo-boost"
import { split } from "apollo-link"
import { createHttpLink } from "apollo-link-http"
import { WebSocketLink } from "apollo-link-ws"
import { InMemoryCache } from "apollo-cache-inmemory"
import { getMainDefinition } from "apollo-utilities"
import VueApollo from "vue-apollo"

Vue.use(VueApollo)

const httpLink = createHttpLink({
  uri: process.env.VUE_APP_GRAPHQL_URL
})

const webSocketLink = new WebSocketLink({
  uri: process.env.VUE_APP_GRAPHQL_URL_SUB,
  options: {
    reconnect: true
  }
})

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    )
  },
  webSocketLink,
  httpLink
)

const cache = new InMemoryCache()

const apolloClient = new ApolloClient({
  link,
  cache,
  connectToDevTools: true
})

export const createApolloProvider = () => {
  return new VueApollo({
    defaultClient: apolloClient
  })
}
