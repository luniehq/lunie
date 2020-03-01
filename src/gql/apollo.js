import Vue from "vue"
import { ApolloClient } from "apollo-boost"
import { BatchHttpLink } from "apollo-link-batch-http"
import { RetryLink } from "apollo-link-retry"
import { ApolloLink, concat, Observable as LinkObservable } from "apollo-link"
import { createPersistedQueryLink } from "apollo-link-persisted-queries"
import { WebSocketLink } from "apollo-link-ws"
import {
  InMemoryCache,
  IntrospectionFragmentMatcher
} from "apollo-cache-inmemory"
import { split } from "apollo-link"
import { getMainDefinition } from "apollo-utilities"
import VueApollo from "vue-apollo"
import { getGraphqlHost } from "scripts/url"
import * as Sentry from "@sentry/browser"
import config from "src/../config"
import * as Fingerprint2 from "fingerprintjs2"
import introspectionQueryResultData from "src/../fragmentTypes.json"

Vue.use(VueApollo)

const makeHttpLink = () => {
  const host = getGraphqlHost()
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

const makeWebSocketLink = () => {
  const host = getGraphqlHost()
  const uri = `${host.replace("http", "ws")}/graphql`
  console.log("ws", uri)
  return new WebSocketLink({ uri })
}

const createApolloClient = () => {
  var fp_options = {
    excludes: {
      touchSupport: true
    }
  }
  const fingerprint = (async () => {
    const components = await Fingerprint2.getPromise(fp_options)
    const values = components.map(component => component.value)
    const fingerprint = Fingerprint2.x64hash128(values.join(``), 31)
    return fingerprint
  })()
  const middleware = new ApolloLink((operation, forward) => {
    // add the authorization to the headers
    operation.setContext({
      headers: {
        fingerprint
      }
    })
    return forward(operation)
  })
  const link = ApolloLink.from([
    // suspending errors, preventing to fire them
    new ApolloLink((operation, forward) => {
      return new LinkObservable(observer => {
        let sub
        sub = forward(operation).subscribe({
          next: result => {
            // check if we have errors
            if (!result.errors) {
              observer.next(result)
            } else {
              result.errors.map(err => {
                // if sentry is enabled pass all error directly to sentry
                if (config.sentryDSN) {
                  // pass errors to sentry
                  Sentry.captureException(err)
                } else {
                  throw err
                }
              })
            }
          },
          error: err => {
            // pass errors to sentry
            if (config.sentryDSN) {
              Sentry.captureException(err)
            } else {
              throw err
            }
          },
          complete: observer.complete.bind(observer)
        })
        return () => {
          if (sub) sub.unsubscribe()
        }
      })
    }),
    split(
      ({ query }) => {
        const definition = getMainDefinition(query)
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        )
      },
      makeWebSocketLink(),
      makeHttpLink()
    )
  ])

  const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData
  })
  const cache = new InMemoryCache({ fragmentMatcher })

  return new ApolloClient({
    link: concat(middleware, link),
    cache,
    connectToDevTools: true,
    shouldBatch: true
  })
}

export const createApolloProvider = () => {
  return new VueApollo({
    defaultClient: createApolloClient(),
    defaultOptions: {
      // apollo options applied to all queries in components
      $query: {
        fetchPolicy: "cache-and-network"
      }
    }
  })
}
