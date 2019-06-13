jest.mock(`scripts/keystore.js`, () => ({
  getKey: () => ({
    cosmosAddress: `cosmos1r5v5srda7xfth3hn2s26txvrcrntldjumt8mhl`,
    privateKey: `8088c2ed2149c34f6d6533b774da4e1692eb5cb426fdbaef6898eeda489630b7`,
    publicKey: `02ba66a84cf7839af172a13e7fc9f5e7008cb8bca1585f8f3bafb3039eda3c1fdd`
  })
}))

jest.mock(`src/config.js`, () => ({
  default_gas: 42
}))

jest.mock(`@lunie/cosmos-keys`, () => ({
  sign: jest.fn(() => []),
  createBroadcastBody: jest.fn(() => ({
    broadcast: `body`
  })),
  createSignedTx: jest.fn(() => {}),
  createSignMessage: jest.fn(() => {})
}))

jest.mock(
  `@lunie/cosmos-js`,
  () =>
    class MockCosmosJs {
      constructor() {}

      MsgSend() {
        return {
          simulate: () => 123123,
          send: async () =>
            Promise.resolve({
              included: () => Promise.resolve()
            })
        }
      }
    }
)

// const mockRootState = {
//   session: {
//     account: `default`,
//     address: `cosmos1superaddress`
//   },
//   wallet: {
//     accountNumber: `12`,
//     address: `cosmos1demo`
//   },
//   connection: {
//     connected: true,
//     lastHeader: {
//       chain_id: `mock-chain`
//     }
//   },
//   ledger: { isConnected: false },
//   stakingParameters: { parameters: { bond_denom: `uatom` } }
// }

describe(`Module: Send`, () => {
  // let module, state, actions, node
  // const gas_prices = [
  //   {
  //     amount: `0.025`, // recommended on Cosmos Docs
  //     denom: `uatom` //TODO: this shouldn't be hardcoded
  //   }
  // ]

  // beforeEach(() => {
  //   node = {
  //     url: "https://lunie.io",
  //     send: jest.fn(async (...args) => {
  //       const req = args[args.length - 1]
  //       const simulate = req && req.base_req && req.base_req.simulate
  //       if (simulate) {
  //         return Promise.resolve({ gas_estimate: `123123` })
  //       } else {
  //         return Promise.resolve({ msg: {} })
  //       }
  //     }),
  //     postTx: jest.fn(() =>
  //       Promise.resolve({
  //         height: `1`,
  //         txhash: `h`
  //       })
  //     )
  //   }
  //   module = sendModule({
  //     node
  //   })
  //   state = module.state
  //   actions = module.actions
  // })

  describe(`Actions`, () => {
    xit(`should postSubmitSend`, () => {})
  })
})
