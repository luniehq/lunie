const dev = process.env.NODE_ENV === `development`
const stargate = process.env.STARGATE || `http://localhost:9071`
const graphql = process.env.VUE_APP_GRAPHQL_URL || `localhost:8080`

export default {
  name: `Lunie`,
  development: dev,
  network: `cosmos-hub-mainnet`,
  stargate,
  graphql,
  google_analytics_uid: process.env.GOOGLE_ANALYTICS_UID || "",
  default_gas_price: dev ? 1e-9 : 2.5e-8, // Recommended from Cosmos Docs

  // Ledger
  CosmosAppTestModeAllowed: false,
  mobileApp: Boolean(process.env.MOBILE_APP),

  graphqlHost: process.env.VUE_APP_GRAPHQL_URL || "localhost:4000",

  e2e: process.env.VUE_APP_E2E
}
