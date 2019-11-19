import Vue from "vue"
import { ApolloClient } from "apollo-boost"
import { createPersistedQueryLink } from "apollo-link-persisted-queries"
import { createHttpLink } from "apollo-link-http"
import { WebSocketLink } from "apollo-link-ws"
import { InMemoryCache } from "apollo-cache-inmemory"
import { split } from "apollo-link"
import { getMainDefinition } from "apollo-utilities"
import VueApollo from "vue-apollo"
import config from "src/../config"

Vue.use(VueApollo)

const graphqlHost = urlParams => urlParams.graphql || config.graphqlHost

const makeHttpLink = urlParams => {
  const host = graphqlHost(urlParams)
  const uri = `${host}/query`

  // We create a createPersistedQueryLink to lower network usage.
  // With this, a prefetch is done using a hash of the query.
  // if the server recognises the hash, it will reply with the full reponse.
  return createPersistedQueryLink().concat(
    createHttpLink({
      uri
    })
  )
}

const makeWebSocketLink = urlParams => {
  const host = graphqlHost(urlParams)
  const uri = `${host.replace("http", "ws")}/subscription`
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
