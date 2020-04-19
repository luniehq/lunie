import ActionManager from "src/ActionModal/utils/ActionManager.js"
import { cancelSign, signQueue } from "src/ActionModal/utils/signer"
import { sendTx } from "./actions"

jest.mock("src/../config.js", () => ({
  default_gas_price: 2.5e-8,
  graphqlHost: "http://localhost:4000"
}))

jest.mock("scripts/fingerprint", () => ({
  getFingerprint: jest.fn(() => "iamafingerprint")
}))

let mockSimulate = jest.fn(() => 12345)
const SendTxFn = jest.fn(() => ({ included: () => async () => true }))
const mockGet = jest.fn()
const mockSendTx = jest.fn(() => ({
  simulate: mockSimulate,
  send: SendTxFn
}))

const mockMultiMessage = jest.fn(() => ({
  simulate: mockSimulate,
  send: SendTxFn
}))

const mockClaimRewardsTx = jest.fn(() => ({
  simulate: mockSimulate,
  send: () => ({ included: () => async () => true })
}))

const mockGetSignedTransactionCreator = jest.fn(() => {
  console.log("mockGetSignedTransactionCreator executed")
  return jest.fn().mockResolvedValue(() => console.log("Hello"))
})

const mockMessageConstructor = jest.fn().mockImplementation(() => {
  return {
    get: mockGet,
    SendTx: mockSendTx,
    ClaimRewardsTx: mockClaimRewardsTx,
    MultiMessage: mockMultiMessage,
    getSignedTransactionCreator: mockGetSignedTransactionCreator
  }
})
jest.mock(`cosmos-apiV0`, () => ({
  default: mockMessageConstructor,
  createSignedTransaction: jest.fn(() => "signedMessage"),
  __esModule: true
}))
jest.mock(`cosmos-apiV2`, () => ({
  default: mockMessageConstructor,
  createSignedTransaction: jest.fn(() => "signedMessage"),
  __esModule: true
}))

jest.mock(`src/ActionModal/utils/signer.js`, () => ({
  getSigner: jest.fn(() => "signer"),
  cancelSign: jest.fn(),
  signQueue: jest.fn()
}))

const mockFetch = jest.fn(() =>
  Promise.resolve({
    json: () => ({ success: true, hash: "abcdsuperhash" })
  })
)

let actionManager
describe("ActionManager", () => {
  // values passed in from the ActionModal component
  const defaultContext = {
    chainId: "cosmos",
    network: {
      id: "cosmos-hub-testnet",
      coinLookup: [{ viewDenom: "uatom" }],
      network_type: "cosmos"
    },
    connected: true,
    userAddress: "cosmos12345",
    rewards: [
      { amount: 100, validator: { operatorAddress: `cosmos1` } },
      { amount: 1, validator: { operatorAddress: `cosmos2` } },
      { amount: 5, validator: { operatorAddress: `cosmos3` } },
      { amount: 3, validator: { operatorAddress: `cosmos4` } },
      { amount: 0, validator: { operatorAddress: `cosmos5` } },
      { amount: 99, validator: { operatorAddress: `cosmos6` } },
      { amount: 9, validator: { operatorAddress: `cosmos7` } },
      { amount: 96, validator: { operatorAddress: `cosmos8` } },
      { amount: 98, validator: { operatorAddress: `cosmos9` } },
      { amount: 97, validator: { operatorAddress: `cosmos10` } }
    ]
  }
  beforeEach(async () => {
    global.fetch = mockFetch

    actionManager = new ActionManager()
  })

  describe("simulating and sending", () => {
    it("should cancel request", async () => {
      await actionManager.cancel(
        {
          userAddress: `testaddress`,
          networkId: `testnetwork`
        },
        `extension`
      )
      expect(cancelSign).toHaveBeenCalledWith(`extension`, {
        address: `testaddress`,
        network: `testnetwork`
      })
    })
    it("should retrun sign queue", async () => {
      await actionManager.getSignQueue(`extension`)
      expect(signQueue).toHaveBeenCalledWith(`extension`)
    })

    it("should estimate via Tx API", async () => {
      actionManager.transactionAPIRequest = jest
        .fn()
        .mockResolvedValue({ success: true, gasEstimate: 12345 })

      await actionManager.simulateTxAPI(
        defaultContext,
        "SendTx",
        sendTx.txProps
      )

      const expectArgs = {
        simulate: true,
        messageType: "SendTx",
        address: "cosmos12345",
        networkId: "cosmos-hub-testnet",
        txProperties: {
          amounts: [{ amount: "20000", denom: "uatom" }],
          toAddress: "cosmos123"
        }
      }

      expect(actionManager.transactionAPIRequest).toHaveBeenCalledWith(
        expectArgs
      )
    })

    it("should estimate via Tx API FAILS", async () => {
      actionManager.transactionAPIRequest = jest
        .fn()
        .mockResolvedValue({ success: false })

      await expect(
        actionManager.simulateTxAPI(
          defaultContext,
          "SendTx",
          sendTx.txProps,
          "memo"
        )
      ).rejects.toThrow()
    })

    it("should send via Tx API", async () => {
      const context = {
        ...defaultContext,
        account: {
          accountNumber: 1,
          sequence: 1
        }
      }

      actionManager.transactionAPIRequest = jest
        .fn()
        .mockResolvedValue({ success: true, hash: "abcdsuperhash" })

      await actionManager.sendTxAPI(
        context,
        "SendTx",
        "memo",
        sendTx.txProps,
        sendTx.txMetaData
      )

      const expectArgs = {
        simulate: false,
        messageType: "SendTx",
        networkId: "cosmos-hub-testnet",
        signedMessage: "signedMessage",
        senderAddress: "cosmos12345"
      }

      expect(actionManager.transactionAPIRequest).toHaveBeenCalledWith(
        expectArgs
      )
    })

    it("should send via Tx API (withdraw)", async () => {
      const context = {
        ...defaultContext,
        account: {
          accountNumber: 1,
          sequence: 1
        }
      }

      actionManager.transactionAPIRequest = jest
        .fn()
        .mockResolvedValue({ success: true, hash: "abcdsuperhash" })

      await actionManager.sendTxAPI(
        context,
        "ClaimRewardsTx",
        "memo",
        sendTx.txProps,
        sendTx.txMetaData
      )

      const expectArgs = {
        simulate: false,
        messageType: "ClaimRewardsTx",
        networkId: "cosmos-hub-testnet",
        signedMessage: "signedMessage",
        senderAddress: "cosmos12345"
      }

      expect(actionManager.transactionAPIRequest).toHaveBeenCalledWith(
        expectArgs
      )
    })

    it("should send via Tx API FAILS", async () => {
      const context = {
        ...defaultContext,
        account: {
          accountNumber: 1,
          sequence: 1
        }
      }

      actionManager.transactionAPIRequest = jest
        .fn()
        .mockResolvedValue({ success: false, hash: 1234 })

      await expect(
        actionManager.sendTxAPI(
          context,
          "SendTx",
          "memo",
          sendTx.txProps,
          sendTx.txMetaData
        )
      ).rejects.toThrow()
    })

    it("should send estimate request", async () => {
      const payload = {
        simulate: true,
        messageType: "SendTx",
        networkId: "cosmos-hub-testnet",
        signedMessage: "signedMessage"
      }

      const args2 = {
        body:
          '{"payload":{"simulate":true,"messageType":"SendTx","networkId":"cosmos-hub-testnet","signedMessage":"signedMessage"}}',
        headers: {
          "Content-Type": "application/json",
          fingerprint: "iamafingerprint"
        },
        method: "POST"
      }

      await actionManager.transactionAPIRequest(payload)
      expect(mockFetch).toHaveBeenLastCalledWith(
        "http://localhost:4000/transaction/estimate",
        args2
      )
    })

    it("should send broadcast request", async () => {
      const payload = {
        simulate: false,
        messageType: "SendTx",
        networkId: "cosmos-hub-testnet",
        signedMessage: "signedMessage"
      }

      const args2 = {
        body:
          '{"payload":{"simulate":false,"messageType":"SendTx","networkId":"cosmos-hub-testnet","signedMessage":"signedMessage"}}',
        headers: {
          "Content-Type": "application/json",
          fingerprint: "iamafingerprint"
        },
        method: "POST"
      }

      await actionManager.transactionAPIRequest(payload)
      expect(mockFetch).toHaveBeenLastCalledWith(
        "http://localhost:4000/transaction/broadcast",
        args2
      )
    })
  })
})
