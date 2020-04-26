require('dotenv').config()
const secrets = require('./secrets')

const env = process.env.NODE_ENV || 'development'
console.info('\nPort read from Docker secrets', secrets.read('PORT'))

module.exports = {
  env: env,
  port: secrets.read('PORT') || process.env.PORT || '4000',
  queryPath: '/',
  transactionPath: '/transaction',
  pushRegistrationPath: '/push',
  subscriptionPath: '/graphql',
  apollo_engine_api_key: process.env.ENGINE_API_KEY || '',
  enable_cache: process.env.ENABLE_CACHE || false,
  redis_url: process.env.REDIS_URL || '',
  hasura_admin_key: process.env.HASURA_ADMIN_KEY || '',
  hasura_url: process.env.HASURA_URL || 'http://localhost:8080/v1/graphql',
  enableTestnet: process.env.TESTNET === 'true',
  testnetRPC: process.env.TESTNET_RPC_URL || 'ws://localhost:26657/websocket',
  testnetAPI: process.env.TESTNET_API_URL || 'http://localhost:9071',
  SENTRY_DSN: process.env.SENTRY_DSN || '',
  firebaseDatabaseUrl: process.env.PUSH_NOTIFICATIONS_DATABASE_URL || '',
  firebasePushNotificationsFrontendUrl:
    process.env.PUSH_NOTIFICATIONS_FRONTEND_URL || 'https://app.lunie.io',
  firebaseAdminKeySet: !!process.env.GOOGLE_APPLICATION_CREDENTIALS
}
