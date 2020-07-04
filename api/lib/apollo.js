const { ApolloServer } = require('apollo-server-express')
const responseCachePlugin = require('apollo-server-plugin-response-cache')
const Sentry = require('@sentry/node')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const Notifications = require('./notifications')
const database = require('./database')

const NetworkContainer = require('./network-container')

const firebaseAdmin = require('./firebase')
const config = require('../config')

const db = database(config)('')

function getDataSources(networks) {
  return () => {
    const sources = {}
    networks.forEach((network) => {
      sources[network.id] = network.createDataSource()
    })

    return {
      ...sources
    }
  }
}

function startBlockTriggers(networks) {
  networks.map((network) => network.initialize())
}

async function checkIsValidIdToken(idToken) {
  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken)
    return decodedToken.uid
  } catch (error) {
    console.error(error)
    Sentry.captureException(error)
    return false
  }
}

async function createApolloServer(httpServer) {
  const networkList = await db.getNetworks()
  const networks = networkList.map((network) => new NetworkContainer(network))

  if (config.env !== 'test') {
    startBlockTriggers(networks)
  }

  let options = {
    typeDefs,
    resolvers: resolvers(networkList),
    dataSources: getDataSources(networks),
    cacheControl: {
      defaultMaxAge: 10
    },
    introspection: true,
    playground: true,
    engine: {
      apiKey: config.apollo_engine_api_key,
      schemaTag: 'production'
    },
    plugins: [responseCachePlugin()],
    subscriptions: {
      path: config.subscriptionPath
    },
    context: async ({ req, connection }) => {
      if (connection) {
        return {
          dataSources: getDataSources(networks)
        }
      }
      if (req) {
        if (process.env.WHITELIST_ORIGIN) {
          const origin = req.get('origin')
          if (!process.env.WHITELIST_ORIGIN.split(',').includes(origin)) {
            throw new Error(`Access Forbidden`)
          }
        }
        const idToken = req.headers.authorization
        let uid = undefined
        if (idToken) {
          uid = await checkIsValidIdToken(idToken)
        }
        return {
          fingerprint: req.headers.fingerprint,
          development: req.headers.development,
          authorization: {
            uid
          }
        }
      }
    }
  }

  if (config.enable_cache) {
    options.cache = require('./redis').createCache()
  }
  const apolloServer = new ApolloServer(options)
  apolloServer.installSubscriptionHandlers(httpServer)

  Notifications.startNotificationService(networkList)

  return apolloServer
}

module.exports = { createApolloServer }
