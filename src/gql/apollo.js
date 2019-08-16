import Vue from "vue"
import ApolloClient from "apollo-boost"
import { InMemoryCache } from "apollo-cache-inmemory"
import VueApollo from "vue-apollo"

const apolloClient = new ApolloClient({
  uri: `https://backend.lunie.io/v1/graphql`
})

Vue.use(VueApollo)

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  cache: new InMemoryCache()
})

export default apolloProvider
