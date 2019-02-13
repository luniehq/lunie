const dev = process.env.NODE_ENV === `development`
const stargate =
  process.env.STARGATE ||
  (dev
    ? `localhost:8080`
    : `https://sntajlxzsg.execute-api.eu-central-1.amazonaws.com/dev/`)

const rpc =
  process.env.RPC ||
  (dev ? `localhost:26657` : `https://test.voyager.ninja:26657/`)

const faucet = process.env.FAUCET || `https://faucet.voyager.ninja`

export default {
  name: `Cosmos Voyager`,
  default_network: `${dev ? `local-` : ``}testnet`,
  denoms: [`stake`, `photino`],
  stargate,
  rpc,
  google_analytics_uid: `UA-51029217-3`,
  sentry_dsn: `https://4dee9f70a7d94cc0959a265c45902d84:cbf160384aab4cdeafbe9a08dee3b961@sentry.io/288169`,
  node_halted_timeout: 120000,
  block_timeout: 10000,
  default_gas: 500000,
  faucet
}
