const express = require('express')
const http = require('http')
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

app.use(config.transactionPath, transaction)
app.use(apolloServer.getMiddleware({ app, path: config.queryPath }))

apolloServer.installSubscriptionHandlers(httpServer)

httpServer.listen({ port: config.port }, () => {
  console.log(`GraphQL Queries ready at ${apolloServer.graphqlPath}`)
  console.log(
    `GraphQL Subscriptions ready at ${apolloServer.subscriptionsPath}`
  )
  console.log(`Transaction service ready at ${config.transactionPath}`)
})
