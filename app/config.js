const dev = process.env.NODE_ENV === `development`
const graphql = process.env.VUE_APP_GRAPHQL_URL || `http://localhost:4000`
const sentryDSN = process.env.SENTRY_DSN || ""

const fallbackNetwork = `cosmos-hub-mainnet`

export default {
  name: `Lunie`,
  development: dev,
  network: process.env.NETWORK || fallbackNetwork,
  google_analytics_uid: process.env.GOOGLE_ANALYTICS_UID || "",
  sentryDSN: dev ? "" : sentryDSN,
  default_gas_price: dev ? 1e-9 : 0.65e-8, // Recommended from Cosmos Docs devided by 4 as we increased the gas amount heavily

  // Ledger
  CosmosAppTestModeAllowed: false,
  mobileApp: Boolean(process.env.MOBILE_APP),
  isExtension: Boolean(process.env.EXTENSION),

  graphqlHost: graphql,

  e2e: process.env.VUE_APP_E2E || false,

  referralLinks: {
    Coinbase: "https://coinbase-consumer.sjv.io/31vxX",
  },

  firebaseConfig: JSON.parse(process.env.VUE_APP_FIREBASE_CONFIG || "{}"),
  digitalOceanURL: process.env.VUE_APP_DIGITALOCEAN_URL,
}
