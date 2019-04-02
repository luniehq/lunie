const dev = process.env.NODE_ENV === `development`
const stargate =
  process.env.STARGATE ||
  (dev
    ? `http://localhost:8080`
    : `https://sntajlxzsg.execute-api.eu-central-1.amazonaws.com/dev/`)

const rpc =
  process.env.RPC ||
  (dev ? `localhost:26657` : `https://test.voyager.ninja:26657/`)

const faucet = process.env.FAUCET !== undefined ? process.env.FAUCET : `https://faucet.voyager.ninja`

export default {
  name: `Cosmos Voyager`,
  development: dev,
  default_network: `${dev ? `local-` : ``}testnet`,
  stargate,
  rpc,
  google_analytics_uid: `UA-51029217-3`,
  sentry_dsn: `https://afb30cc1460e4464a98e89600bb0926e@sentry.io/1429416`,
  node_halted_timeout: 120000,
  block_timeout: 10000,
  default_gas_price: 2.5e-8, // recomended from Cosmos Docs
  default_gas_adjustment: 1.5,
  faucet,
  version: process.env.RELEASE
}
