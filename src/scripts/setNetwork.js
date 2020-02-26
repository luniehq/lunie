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
  if (path === "/") {
    path = "/portfolio"
  }

  // if the url is of the form /cosmos-hub/portfolio the path we want to add later is /portfolio and not the whole thing
  if (to.params.networkId) {
    const subPathRegexp = /\/.+(\/.+)/ //extracts the subpath
    const match = subPathRegexp.exec(to.path)
    if (match && match.length >= 2) {
      // the path is is of form /cosmos-hub/portfolio
      path = match[1]
    } else {
      // the path is is of form /cosmos-hub so we forward to portfolio
      path = "/portfolio"
    }
  }

  // current network slug
  let network
  if (
    to.params.networkId &&
    store.state.connection.networkSlug === to.params.networkId
  ) {
    next() // all as expected
    return
  }
  // desired network is different then current
  if (
    to.params.networkId &&
    store.state.connection.networkSlug !== to.params.networkId
  ) {
    // setting new network
    network = networkChecker(
      networks.find(network => network.slug === to.params.networkId),
      networks
    )

    store.dispatch(`setNetwork`, network)
    next(`/${network.slug}${path}`)
  }
  // no network is set so we set the default
  if (!to.params.networkId) {
    // swithing to current network
    if (store.state.connection.networkSlug) {
      network = networkChecker(
        networks.find(
          network => network.slug === store.state.connection.networkSlug
        ),
        networks
      )

      store.dispatch(`setNetwork`, network)
      next(`/${network.slug}${path}`)
    } else {
      network = networks.find(network => network.default === true)
      next(`/${network.slug}${path}`)
    }
  }
}

function networkChecker(network, networks) {
  return network ? network : networks.find(network => network.default === true)
}
