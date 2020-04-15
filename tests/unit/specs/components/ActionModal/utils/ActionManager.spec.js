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

jest.mock(`cosmos-apiV0`, () => ({
  createSignedTransaction: jest.fn(() => "signedMessage"),
  __esModule: true
}))
jest.mock(`cosmos-apiV2`, () => ({
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

    actionManager = new ActionManager({ network_type: "cosmos" })
    actionManager.signedTransactionCreated = jest.fn(() => "signedMessage")
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
        "MsgSend",
        sendTx.txProps
      )

      const expectArgs = {
        simulate: true,
        messageType: "MsgSend",
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
          "MsgSend",
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
        "MsgSend",
        "memo",
        sendTx.txProps,
        sendTx.txMetaData,
        {
          amount: 0,
          denom: "STAKE"
        }
      )

      const expectArgs = {
        simulate: false,
        messageType: "MsgSend",
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
        "MsgWithdrawDelegationReward",
        "memo",
        sendTx.txProps,
        sendTx.txMetaData,
        {
          amount: 0,
          denom: "STAKE"
        }
      )

      const expectArgs = {
        simulate: false,
        messageType: "MsgWithdrawDelegationReward",
        networkId: "cosmos-hub-testnet",
        signedMessage: "signedMessage",
        senderAddress: "cosmos12345"
      }

      expect(actionManager.transactionAPIRequest).toHaveBeenCalledWith(
        expectArgs
      )
    })

    it("should send a donation message if donation is higher then 0", async () => {
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

      actionManager.signedTransactionCreated.mockClear()
      await actionManager.sendTxAPI(
        context,
        "MsgWithdrawDelegationReward",
        "memo",
        sendTx.txProps,
        sendTx.txMetaData,
        {
          amount: 5,
          denom: "STAKE"
        }
      )

      const expectArgs = {
        simulate: false,
        messageType: "MsgWithdrawDelegationReward",
        networkId: "cosmos-hub-testnet",
        signedMessage: "signedMessage",
        senderAddress: "cosmos12345"
      }

      expect(actionManager.transactionAPIRequest).toHaveBeenCalledWith(
        expectArgs
      )
      expect(
        actionManager.signedTransactionCreated.mock.calls
      ).toMatchSnapshot()
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
          "MsgSend",
          "memo",
          sendTx.txProps,
          sendTx.txMetaData,
          {
            amount: 0,
            denom: "STAKE"
          }
        )
      ).rejects.toThrow()
    })

    it("should send estimate request", async () => {
      const payload = {
        simulate: true,
        messageType: "MsgSend",
        networkId: "cosmos-hub-testnet",
        signedMessage: "signedMessage"
      }

      const args2 = {
        body:
          '{"payload":{"simulate":true,"messageType":"MsgSend","networkId":"cosmos-hub-testnet","signedMessage":"signedMessage"}}',
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
        messageType: "MsgSend",
        networkId: "cosmos-hub-testnet",
        signedMessage: "signedMessage"
      }

      const args2 = {
        body:
          '{"payload":{"simulate":false,"messageType":"MsgSend","networkId":"cosmos-hub-testnet","signedMessage":"signedMessage"}}',
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
