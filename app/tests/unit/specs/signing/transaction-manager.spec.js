import TransactionManager from "src/signing/transaction-manager.js"
import { cancelSign, signQueue } from "src/signing/signer"

jest.mock("src/../config.js", () => ({
  default_gas_price: 2.5e-8,
  graphqlHost: "http://localhost:4000",
}))

jest.mock("scripts/fingerprint", () => ({
  getFingerprint: jest.fn(() => "iamafingerprint"),
}))

jest.mock(`src/signing/signer.js`, () => ({
  getSigner: () => () => ({
    // demoing a Cosmos signedContext here
    signature: "abcd",
    publicKey: Buffer.from("superpubkey"),
  }),
  cancelSign: jest.fn(),
  signQueue: jest.fn(),
}))

const mockFetch = jest.fn(() =>
  Promise.resolve({
    json: () => ({ success: true, hash: "abcdsuperhash" }),
  })
)

let transactionManager
describe("Transaction Manager", () => {
  // values passed in from the ActionModal component
  const defaultContext = {
    messageType: "SendTx",
    message: {
      amount: {
        amount: 2,
        denom: "ATOM",
      },
      to: ["cosmos12345"],
    },
    transactionData: {
      accountNumber: 1,
      accountSequence: 1,
      chainId: "lunie-net",
      gasEstimate: "200000",
      fee: [
        {
          amount: "10",
          denom: "uatom",
        },
      ],
      memo: "",
    },
    senderAddress: "cosmos12345",
    network: {
      id: "cosmos-hub-testnet",
      coinLookup: [
        {
          viewDenom: "ATOM",
          chainToViewConversionFactor: 1000000,
          chainDenom: "uatom",
        },
      ],
      network_type: "cosmos",
    },
    signingType: "local",
    password: "1234567890",
  }
  beforeEach(async () => {
    global.fetch = mockFetch

    transactionManager = new TransactionManager()
  })

  describe("Extension queue handling", () => {
    it("should cancel request", async () => {
      await transactionManager.cancel(
        {
          userAddress: `testaddress`,
          networkId: `testnetwork`,
        },
        `extension`
      )
      expect(cancelSign).toHaveBeenCalledWith(`extension`, {
        address: `testaddress`,
        network: `testnetwork`,
      })
    })
    it("should retrun sign queue", async () => {
      await transactionManager.getSignQueue(`extension`)
      expect(signQueue).toHaveBeenCalledWith(`extension`)
    })
  })

  describe("Create sign broadcast", () => {
    it("should create sign and broadcast a transaction for Cosmos", async () => {
      transactionManager.broadcastAPIRequest = jest
        .fn()
        .mockResolvedValue({ success: true, hash: "abcdsuperhash" })

      await transactionManager.createSignBroadcast(defaultContext)

      const broadcastableObject = {
        fee: {
          amount: [
            {
              amount: "10",
              denom: "uatom",
            },
          ],
          gas: "200000",
        },
        memo: "",
        msg: [
          {
            type: "cosmos-sdk/MsgSend",
            value: {
              amount: [
                {
                  amount: "0.000002",
                  denom: "uatom",
                },
              ],
              from_address: "cosmos12345",
              to_address: "cosmos12345",
            },
          },
        ],
        signatures: [
          {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: "c3VwZXJwdWJrZXk=",
            },
            signature: "q80=",
          },
        ],
      }

      const expectArgs = {
        messageType: "SendTx",
        message: {
          amount: {
            amount: 2,
            denom: "ATOM",
          },
          to: ["cosmos12345"],
        },
        networkId: "cosmos-hub-testnet",
        senderAddress: "cosmos12345",
        signedMessage: broadcastableObject,
        transaction: broadcastableObject,
      }

      expect(transactionManager.broadcastAPIRequest).toHaveBeenCalledWith(
        expectArgs
      )
    })

    it("should handle failing broadcast", async () => {
      transactionManager.broadcastAPIRequest = jest
        .fn()
        .mockResolvedValue({ success: false, hash: 1234 })

      await expect(
        transactionManager.createSignBroadcast(defaultContext)
      ).rejects.toThrow()
    })

    it("should send broadcast request", async () => {
      await transactionManager.createSignBroadcast(defaultContext)
      expect(mockFetch.mock.calls[0]).toMatchSnapshot()
    })
  })
})
