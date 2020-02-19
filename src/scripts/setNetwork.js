"use strict"
import gql from "graphql-tag"

export const setNetwork = async ({ to, next }, apollo, store) => {
  const {
    data: { networks }
  } = await apollo.query({
    query: gql`
      query Networks {
        networks {
          slug
          id
          default
        }
      }
    `,
    fetchPolicy: "cache-first"
  })
  let path = to.path
  if (path == "/") {
    path = "/portfolio"
  }
  // current network slug
  let network
  if (
    store.state.connection.networkSlug != to.params.networkId &&
    to.params.networkId
  ) {
    // setting new network
    network = networks.find(network => network.slug === to.params.networkId)
    if (!network) {
      network = networks.find(network => network.default === true)
    }
    store.dispatch(`setNetwork`, network)
    next(`/${network.slug}${path}`)
  } else if (!to.params.networkId) {
    // swithing to current network
    if (store.state.connection.networkSlug) {
      network = networks.find(
        network => network.slug === store.state.connection.networkSlug
      )
      if (!network) {
        network = networks.find(network => network.default === true)
      }
      store.dispatch(`setNetwork`, network)
      next(`/${network.slug}${path}`)
    } else {
      network = networks.find(network => network.default === true)
      next(`/${network.slug}${path}`)
    }
  } else {
    next()
  }
}
