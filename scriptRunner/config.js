const secrets = require('../api/secrets')

module.exports = {
    authenticationToken: process.env.AUTHENTICATION_TOKEN || secrets.read('AUTHENTICATION_TOKEN'),
    twitterAuthToken: process.env.TWITTER_AUTH_TOKEN || secrets.read('TWITTER_AUTH_TOKEN'),
    SENTRY_DSN: process.env.SENTRY_DSN || ''
}