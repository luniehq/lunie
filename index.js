const express = require('express')
const http = require('http')
const cors = require('cors')
const { createApolloServer } = require('./lib/apollo')
const transaction = require('./lib/routes/transaction')

const config = require('./config')

if (config.SENTRY_DSN) {
  const Sentry = require('@sentry/node')
  Sentry.init({ dsn: config.SENTRY_DSN })
}

const app = express()
const httpServer = http.createServer(app)
const apolloServer = new createApolloServer()

var allowed = ['https://app.lunie.io']

if (config.env === 'development') {
  allowed.push('http://localhost:9080')
}

var corsOptions = {
  origin: function(origin, callback) {
    if (allowed.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(express.json())
app.use(config.transactionPath, cors(corsOptions), transaction)
app.use(apolloServer.getMiddleware({ app, path: config.queryPath }))

apolloServer.installSubscriptionHandlers(httpServer)

httpServer.listen({ port: config.port }, () => {
  console.log(`GraphQL Queries ready at ${apolloServer.graphqlPath}`)
  console.log(
    `GraphQL Subscriptions ready at ${apolloServer.subscriptionsPath}`
  )
  console.log(`Transaction service ready at ${config.transactionPath}`)
})
