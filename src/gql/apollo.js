import Vue from "vue"
import ApolloClient from "apollo-boost"
import { InMemoryCache } from "apollo-cache-inmemory"
import VueApollo from "vue-apollo"

const apolloClient = new ApolloClient({
  uri: process.env.VUE_APP_GRAPHQL_URL,
  headers: {
    "x-hasura-admin-secret": process.env.VUE_APP_HASURA_SECRET
  }
})

Vue.use(VueApollo)

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  cache: new InMemoryCache()
})

export default apolloProvider
