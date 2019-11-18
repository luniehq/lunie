const dev = process.env.NODE_ENV === `development`

const stargate =
  process.env.STARGATE ||
  (dev ? `https://localhost:9071` : `https://stargate.lunie.io`)

export default {
  development: dev,
  google_analytics_uid: process.env.GOOGLE_ANALYTICS_UID || '', // needs to be configured in webpack.config.js
  sentry_dsn: process.env.SENTRY_DSN || '', // needs to be configured in webpack.config.js
  stargate,
  lunieLink: dev ? `http://localhost:9080` : `https://app.lunie.io`
}
