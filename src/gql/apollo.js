import Vue from "vue"
import { ApolloClient } from "apollo-boost"
import { BatchHttpLink } from "apollo-link-batch-http"
import { RetryLink } from "apollo-link-retry"
import { createPersistedQueryLink } from "apollo-link-persisted-queries"
import { WebSocketLink } from "apollo-link-ws"
import { InMemoryCache } from "apollo-cache-inmemory"
import { split } from "apollo-link"
import { getMainDefinition } from "apollo-utilities"
import VueApollo from "vue-apollo"
import config from "src/../config"

Vue.use(VueApollo)

// persistent api
// setting api url in localStorage
const checkPersistentAPI = urlParams => {
  if (
    typeof urlParams.iwouldliketochangetheapipersistentlyandiknowwhatido !==
    "undefined"
  ) {
    // removing presistent api on false value
    if (
      !urlParams.iwouldliketochangetheapipersistentlyandiknowwhatido ||
      urlParams.iwouldliketochangetheapipersistentlyandiknowwhatido == "false"
    ) {
      localStorage.removeItem(`persistentapi`)
      return false
    }
    // setting presistent api
    if (urlParams.iwouldliketochangetheapipersistentlyandiknowwhatido) {
      localStorage.setItem(
        `persistentapi`,
        decodeURIComponent(
          urlParams.iwouldliketochangetheapipersistentlyandiknowwhatido
        )
      )
      return decodeURIComponent(
        urlParams.iwouldliketochangetheapipersistentlyandiknowwhatido
      )
    }
  }

  if (localStorage.getItem(`persistentapi`)) {
    console.warn(
      "Your API version differ from normal. Query ?iwouldliketochangetheapipersistentlyandiknowwhatido=false to reset"
    )
    return localStorage.getItem(`persistentapi`)
  }
  return false
}

const graphqlHost = urlParams =>
  checkPersistentAPI(urlParams) ||
  (urlParams.api ? decodeURIComponent(urlParams.api) : false) ||
  config.graphqlHost

const makeHttpLink = urlParams => {
  const host = graphqlHost(urlParams)
  const uri = host

  // We create a createPersistedQueryLink to lower network usage.
  // With this, a prefetch is done using a hash of the query.
  // if the server recognises the hash, it will reply with the full response.
  return createPersistedQueryLink().concat(
    new BatchHttpLink({
      uri
    }),
    new RetryLink()
  )
}

const makeWebSocketLink = urlParams => {
  const host = graphqlHost(urlParams)
  const uri = `${host.replace("http", "ws")}/graphql`
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
    connectToDevTools: true,
    shouldBatch: true
  })
}

export const createApolloProvider = urlParams => {
  return new VueApollo({
    defaultClient: createApolloClient(urlParams),
    defaultOptions: {
      // apollo options applied to all queries in components
      $query: {
        fetchPolicy: "cache-and-network"
      }
    }
  })
}
