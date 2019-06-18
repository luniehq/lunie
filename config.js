const dev = process.env.NODE_ENV === `development`;

export default {
  name: `Lunie`,
  development: dev,
  google_analytics_uid: process.env.GOOGLE_ANALYTICS_UID || '',
  sentry_dsn: process.env.SENTRY_DSN || '',
  default_gas_price: dev ? 1e-9 : 2.5e-8, // recommended from Cosmos Docs
  version: process.env.RELEASE,

  // Ledger
  CosmosAppTestModeAllowed: false,
};
