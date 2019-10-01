import Vue from "vue"
import { ApolloClient } from "apollo-boost"
import { split } from "apollo-link"
import { createHttpLink } from "apollo-link-http"
import { WebSocketLink } from "apollo-link-ws"
import { InMemoryCache } from "apollo-cache-inmemory"
import { getMainDefinition } from "apollo-utilities"
import VueApollo from "vue-apollo"
import config from "src/config"

Vue.use(VueApollo)

const graphqlHost = urlParams => urlParams.graphql || config.graphqlHost

console.log(config.development)

const makeHttpLink = urlParams => {
  let prefix = `https`
  if (config.development) {
    prefix = `http`
  }
  const host = graphqlHost(urlParams)
  return createHttpLink({
    uri: `${prefix}://${host}`
  })
}

const makeWebSocketLink = urlParams => {
  let prefix = `wss`
  if (config.development) {
    prefix = `ws`
  }
  const host = graphqlHost(urlParams)
  return new WebSocketLink({
    uri: `${prefix}://${host}/graphql`,
    options: {
      reconnect: true
    }
  })
}

const createApolloClient = urlParams => {
  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      )
    },
    makeWebSocketLink(urlParams),
    makeHttpLink(urlParams)
  )

  const cache = new InMemoryCache()

  return new ApolloClient({
    link,
    cache,
    connectToDevTools: true
  })
}

export const createApolloProvider = urlParams => {
  return new VueApollo({
    defaultClient: createApolloClient(urlParams)
  })
}
