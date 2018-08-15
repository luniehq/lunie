"use strict"

// For some reason we're using a buggy library to pretend to be a browser
// instead of Node.js.  It adds "*/*" to the Accept header incorrectly.
delete global.XMLHttpRequest

const LcdClient = require(`renderer/connectors/lcdClient`)
const { Matchers, Pact } = require(`@pact-foundation/pact`)
const { eachLike } = Matchers
const path = require(`path`)

const provider = new Pact({
  consumer: "Voyager",
  provider: "Cosmos-Lite",
  port: 8998,
  log: path.join(__dirname, `../logs/pact.log`),
  dir: path.join(__dirname, `../pacts`),
  logLevel: "INFO"
})

const exampleValidator = {
  owner: "cosmosaccaddr15vjcmjl5th9qmuzjnqv8puk3gsdrd529e2w6w0",
  pub_key:
    "cosmosvalpub1zcjduepqqyllu6dz74up6w80kvh805jvn0z2ruqj9uucjncc9a9fppfxzkssca9yzl",
  revoked: false,
  status: 2,
  tokens: "100",
  delegator_shares: "100",
  description: {
    moniker: "test_val1",
    identity: "",
    website: "",
    details: ""
  },
  bond_height: "0",
  bond_intra_tx_counter: 0,
  proposer_reward_pool: null,
  commission: "0",
  commission_max: "0",
  commission_change_rate: "0",
  commission_change_today: "0",
  prev_bonded_shares: "0"
}

beforeAll(() => provider.setup())
afterAll(() => provider.finalize())
afterEach(() => provider.verify())

test(`getCandidates`, async () => {
  provider.addInteraction({
    uponReceiving: "getCandidates",
    withRequest: {
      method: "GET",
      path: "/stake/validators",
      headers: { Accept: "application/json" }
    },
    willRespondWith: {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: eachLike(exampleValidator)
    }
  })

  const client = new LcdClient()
  expect(await client.getCandidates()).toEqual([exampleValidator])
})

test(`getDelegator`, async () => {
  provider.addInteraction({
    state: `delegated`,
    uponReceiving: "getDelegator",
    withRequest: {
      method: "GET",
      path: "/stake/delegators/address",
      headers: { Accept: "application/json" }
    },
    willRespondWith: {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: []
    }
  })

  const client = new LcdClient()
  expect(await client.getDelegator(`address`)).toEqual([])
})
