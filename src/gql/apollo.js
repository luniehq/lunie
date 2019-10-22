import Vue from "vue"
import { ApolloClient } from "apollo-boost"
import { split } from "apollo-link"
import { createHttpLink } from "apollo-link-http"
import { WebSocketLink } from "apollo-link-ws"
import { InMemoryCache } from "apollo-cache-inmemory"
import { getMainDefinition } from "apollo-utilities"
import VueApollo from "vue-apollo"
import config from "src/../config"

Vue.use(VueApollo)

const graphqlHost = urlParams => urlParams.graphql || config.graphqlHost

const makeHttpLink = urlParams => {
  let prefix = config.development ? `http` : `https`
  const host = graphqlHost(urlParams)
  const uri = `${prefix}://${host}`
  console.log("http", uri)
  return createHttpLink({ uri })
}

const makeWebSocketLink = urlParams => {
  let prefix = config.development ? `ws` : `wss`
  const host = graphqlHost(urlParams)
  const uri = `${prefix}://${host}/graphql`
  console.log("ws", uri)
  return new WebSocketLink({ uri })
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
