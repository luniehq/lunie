const secrets = require('../api/secrets')

module.exports = {
    authenticationToken: process.env.AUTHENTICATION_TOKEN || secrets.read('AUTHENTICATION_TOKEN'),
    twitterAuthToken: process.env.TWITTER_AUTH_TOKEN,
    SENTRY_DSN: process.env.SENTRY_DSN || '',
    hasura_admin_key:
      secrets.read('HASURA_ADMIN_KEY') || process.env.HASURA_ADMIN_KEY || '',
    hasura_url: process.env.HASURA_URL || 'http://localhost:8080/v1/graphql'
}