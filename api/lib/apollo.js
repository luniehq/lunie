const { ApolloServer } = require('apollo-server-express')
const responseCachePlugin = require('apollo-server-plugin-response-cache')
const firebaseAdmin = require('firebase-admin')
const Sentry = require('@sentry/node')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const Notifications = require('./notifications')

const { networkList } = require('./networks')
const NetworkContainer = require('./network-container')

const config = require('../config')

const firebaseServiceAccount = require('../firebaseCredentials.json')
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseServiceAccount)
})

const networks = networkList.map((network) => new NetworkContainer(network))

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

function startBlockTriggers() {
  networks.map((network) => network.initialize())
}

async function checkIsValidIdToken(idToken) {
  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken)
    return true
  } catch (error) {
    console.error(error)
    Sentry.captureException(error)
    return false
  }
}

function createApolloServer(httpServer) {
  if (config.env !== 'test') {
    startBlockTriggers()
  }

  let options = {
    typeDefs,
    resolvers,
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
        let validToken = false
        if (idToken) {
          validToken = await checkIsValidIdToken(idToken)
        }
        return {
          fingerprint: req.headers.fingerprint,
          development: req.headers.development,
          authorization: {
            idToken: req.headers.authorization,
            valid: validToken
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

  Notifications.startNotificationService()

  return apolloServer
}

module.exports = {
  createApolloServer,
  firebaseAdmin
}
