const express = require('express')
const http = require('http')
const cors = require('cors')
const { createApolloServer } = require('./lib/apollo')
const { transaction } = require('./lib/routes')
const database = require('./lib/database')
const config = require('./config')
const NetworkContainer = require('./lib/network-container')

const db = database(config)('')
const NEW_NETWORKS_POLLING_INTERVAL = 600000 // 10min

if (config.SENTRY_DSN) {
  const Sentry = require('@sentry/node')
  Sentry.init({
    dsn: config.SENTRY_DSN,
    release: require('./package.json').version
  })
}

function getCoinLookup(network, denom, coinLookupDenomType = `chainDenom`) {
  return network.coinLookup.find((coin) => coin[coinLookupDenomType] === denom)
}

async function getNetworks() {
  const networksFromDBList = await db.getNetworks()
  const networkList = networksFromDBList
    .filter((network) => network.enabled)
    // add the getCoinLookup function
    .map((network) => {
      return {
        ...network,
        getCoinLookup
      }
    })
  return {
    networkList,
    networks: networkList.map((network) => new NetworkContainer(network))
  }
}

async function pollForNewNetworks(httpServer, app) {
  const networksResponse = await getNetworks()

  const apolloServer = await createApolloServer(
    httpServer,
    networksResponse.networkList,
    networksResponse.networks
  )
  app.use(
    apolloServer.getMiddleware({ app, path: config.queryPath, cors: true })
  )

  httpServer.listen({ port: config.port }, () => {
    console.log(`GraphQL Queries ready at ${apolloServer.graphqlPath}`)
    console.log(
      `GraphQL Subscriptions ready at ${apolloServer.subscriptionsPath}`
    )
    console.log(`Transaction service ready at ${config.transactionPath}`)
  })
  newNetworksPollingTimeout = setTimeout(async () => {
    httpServer.close({ port: config.port })
    pollForNewNetworks(httpServer, app)
  }, NEW_NETWORKS_POLLING_INTERVAL)
}

async function main() {
  const app = express()
  const httpServer = http.createServer(app)

  app.use(express.json())
  app.use(config.transactionPath, cors(), transaction)

  // start ten minute loop to search for new networks
  pollForNewNetworks(httpServer, app)
}

main()
