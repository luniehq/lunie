"use strict"
import * as Sentry from "@sentry/browser"

export const setNetwork = async ({ to, next }, store) => {
  // networks are loaded async so we may need to wait for them
  while (store.getters.networks.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  try {
    let networks = store.getters.networks
    let path = to.path
    if (path === "/") {
      path = "/portfolio"
    }

    // if the url is of the form /cosmos-hub/portfolio the path we want to add later is /portfolio and not the whole thing
    if (to.params.networkId) {
      const subPathRegexp = /\/[a-zA-Z-]+(\/.+)/ //extracts the subpath
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

      await store.dispatch(`setNetwork`, network)
      next(`/${network.slug}${path}`)
    }

    // no network is set so we set the default
    if (!to.params.networkId || to.params.networkId === "default") {
      // swithing to current network
      if (store.state.connection.networkSlug) {
        network = networkChecker(
          networks.find(
            network => network.slug === store.state.connection.networkSlug
          ),
          networks
        )
      } else {
        network = networks.find(network => network.default === true)
      }

      next(`/${network.slug}${path}`)
      store.dispatch(`setNetwork`, network)
    }
  } catch (error) {
    console.error("Failed to set network from URL", error)
    Sentry.captureException(error)
  }
}

function networkChecker(network, networks) {
  return network ? network : networks.find(network => network.default === true)
}
