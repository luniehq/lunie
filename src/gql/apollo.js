import Vue from "vue"
import ApolloClient from "apollo-boost"
import { InMemoryCache } from "apollo-cache-inmemory"
import VueApollo from "vue-apollo"

Vue.use(VueApollo)

const createApolloClient = urlParams => {
  return new ApolloClient({
    uri: urlParams.graphql || process.env.VUE_APP_GRAPHQL_URL
  })
}

export const createApolloProvider = urlParams => {
  return new VueApollo({
    defaultClient: createApolloClient(urlParams),
    cache: new InMemoryCache()
  })
}
