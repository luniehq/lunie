import ActionManager from "src/ActionModal/utils/ActionManager.js"
// import {
//   getTransactionSigner,
//   transformMessage
// } from "src/ActionModal/utils/MessageConstructor.js"
import { sendTx, withdrawTx } from "./actions"

let mockSimulate = jest.fn(() => 12345)
const MsgSendFn = jest.fn(() => ({ included: () => async () => true }))
const mockGet = jest.fn()
const mockMsgSend = jest.fn(() => ({
  simulate: mockSimulate,
  send: MsgSendFn
}))

const mockMultiMessage = jest.fn(() => ({
  simulate: mockSimulate,
  send: MsgSendFn
}))

const mockMsgWithdraw = jest.fn(() => ({
  simulate: mockSimulate,
  send: () => ({ included: () => async () => true })
}))

const mockGetTransactionSigner = jest.fn(() => {
  console.log("mockGetTransactionSigner executed")
  return jest.fn().mockResolvedValue(() => console.log("Hello"))
})

const mockMessageConstructor = jest.fn().mockImplementation(() => {
  return {
    get: mockGet,
    MsgSend: mockMsgSend,
    MsgWithdrawDelegationReward: mockMsgWithdraw,
    MultiMessage: mockMultiMessage,
    getTransactionSigner: mockGetTransactionSigner
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
  getSigner: jest.fn(() => "signer")
}))

const mockFetch = jest.fn(() =>
  Promise.resolve({
    json: () => ({ success: true, hash: "abcdsuperhash" })
  })
)

let actionManager
describe("ActionManager", () => {
  beforeEach(async () => {
    global.fetch = mockFetch

    actionManager = new ActionManager()
    await actionManager.setContext({
      url: "blah",
      chainId: "cosmos",
      networkId: "cosmos-hub-testnet",
      connected: true,
      userAddress: "cosmos12345",
      totalRewards: 1234,
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
    })
  })

  it("should be created", () => {
    expect(actionManager instanceof ActionManager).toBe(true)
  })

  it("should set context", async () => {
    const context = {
      url: "blah",
      chainId: "cosmos",
      networkId: "cosmos-hub-testnet",
      connected: true
    }
    expect(await actionManager.setContext(context))
    expect(actionManager.cosmos)
    expect(actionManager.context).toEqual({
      url: "blah",
      chainId: "cosmos",
      networkId: "cosmos-hub-testnet",
      connected: true
    })
  })

  it("should throw if setting empty context", async () => {
    try {
      await actionManager.setContext()
    } catch (e) {
      expect(e).toEqual(Error("Context cannot be empty"))
    }
  })

  it("should throw if not connected", async () => {
    try {
      actionManager = new ActionManager()
      await actionManager.setContext({
        url: "blah",
        chainId: "cosmos",
        networkId: "cosmos-hub-testnet",
        connected: false
      })
      actionManager.readyCheck()
    } catch (e) {
      expect(e).toEqual(
        Error(
          "Currently not connected to a secure node. Please try again when Lunie has secured a connection."
        )
      )
    }
  })

  it("should throw if no context", () => {
    try {
      actionManager = new ActionManager()
      actionManager.readyCheck()
    } catch (e) {
      expect(e).toEqual(Error("This modal has no context."))
    }
  })

  it("should throw if message type is empty", () => {
    try {
      actionManager = new ActionManager()
      actionManager.messageTypeCheck()
    } catch (e) {
      expect(e).toEqual(Error("No message type present."))
    }
  })

  it("should throw if message type is incorrect", () => {
    try {
      actionManager = new ActionManager()
      actionManager.messageTypeCheck("invalid")
    } catch (e) {
      expect(e).toEqual(Error(`Invalid message type: invalid.`))
    }
  })

  it("should throw if setting message with empty context ", async () => {
    try {
      actionManager = new ActionManager()
      await actionManager.setMessage("MsgSend", sendTx.txProps)
    } catch (e) {
      expect(e).toEqual(Error("This modal has no context."))
    }
  })

  describe("simulating and sending", async () => {
    beforeEach(async () => {
      const context = {
        url: "blah",
        chainId: "cosmos",
        networkId: "cosmos-hub-testnet",
        connected: true,
        userAddress: "cosmos12345",
        totalRewards: 1234,
        bondDenom: "uatom",
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
      await actionManager.setContext(context)
      await actionManager.setMessage("MsgSend", sendTx.txProps)
    })

    it("should create message", async () => {
      await actionManager.setMessage("MsgSend", sendTx.txProps)
      expect(mockMsgSend).toHaveBeenCalledWith("cosmos12345", sendTx.txProps)
    })

    it("should return gas estimate", async () => {
      mockSimulate = jest.fn(() => 123)
      const data = await actionManager.simulate("memo")
      expect(data).toEqual(12345)
    })

    it("should not send if no message", async () => {
      actionManager = new ActionManager()
      const context = {
        url: "blah",
        chainId: "cosmos",
        networkId: "cosmos-hub-testnet",
        connected: true
      }
      await actionManager.setContext(context)
      await expect(
        actionManager.send("MsgSend", "memo", sendTx.txProps, sendTx.txMetaData)
      ).rejects.toThrowError(`No message to send`)
    })

    it("should send", async () => {
      const result = await actionManager.send("memo", sendTx.txMetaData)
      expect(result)

      expect(mockMsgSend).toHaveBeenCalledWith("cosmos12345", {
        amounts: [{ amount: "20000", denom: "uatom" }],
        toAddress: "cosmos123"
      })

      expect(MsgSendFn).toHaveBeenCalledWith(
        {
          gas: "12335",
          gasPrices: [{ amount: "2000000000", denom: "uatom" }],
          memo: "memo"
        },
        "signer"
      )
    })

    it("should estimate via Tx API", async () => {
      const context = {
        ...actionManager.context,
        account: {
          accountNumber: 1,
          sequence: 1
        }
      }

      actionManager.transactionAPIRequest = jest
        .fn()
        .mockResolvedValue({ success: true, gasEstimate: 12345 })

      await actionManager.simulateTxAPI(context, "MsgSend", sendTx.txProps)

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

    it("should send via Tx API", async () => {
      const context = {
        ...actionManager.context,
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
        sendTx.txMetaData
      )

      const expectArgs = {
        simulate: false,
        messageType: "MsgSend",
        networkId: "cosmos-hub-testnet",
        signedMessage: "signedMessage"
      }

      expect(actionManager.transactionAPIRequest).toHaveBeenCalledWith(
        expectArgs
      )
    })

    it("should send via Tx API (withdraw)", async () => {
      const context = {
        ...actionManager.context,
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
        sendTx.txMetaData
      )

      const expectArgs = {
        simulate: false,
        messageType: "MsgWithdrawDelegationReward",
        networkId: "cosmos-hub-testnet",
        signedMessage: "signedMessage"
      }

      expect(actionManager.transactionAPIRequest).toHaveBeenCalledWith(
        expectArgs
      )
    })

    it("should send via Tx API (withdraw) FAILS", async () => {
      const context = {
        ...actionManager.context,
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
          sendTx.txMetaData
        )
      ).rejects.toThrow()
    })

    it("should send estimate request", () => {
      const payload = {
        simulate: true,
        messageType: "MsgSend",
        networkId: "cosmos-hub-testnet",
        signedMessage: "signedMessage"
      }

      const args2 = {
        body:
          '{"payload":{"simulate":true,"messageType":"MsgSend","networkId":"cosmos-hub-testnet","signedMessage":"signedMessage"}}',
        headers: { "Content-Type": "application/json" },
        method: "POST"
      }

      actionManager.transactionAPIRequest(payload)
      expect(mockFetch).toHaveBeenLastCalledWith(
        "http://localhost:4000/transaction/estimate",
        args2
      )
    })

    it("should send broadcast request", () => {
      const payload = {
        simulate: false,
        messageType: "MsgSend",
        networkId: "cosmos-hub-testnet",
        signedMessage: "signedMessage"
      }

      const args2 = {
        body:
          '{"payload":{"simulate":false,"messageType":"MsgSend","networkId":"cosmos-hub-testnet","signedMessage":"signedMessage"}}',
        headers: { "Content-Type": "application/json" },
        method: "POST"
      }

      actionManager.transactionAPIRequest(payload)
      expect(mockFetch).toHaveBeenLastCalledWith(
        "http://localhost:4000/transaction/broadcast",
        args2
      )
    })

    it("should create multimessage", async () => {
      await actionManager.setMessage(
        "MsgWithdrawDelegationReward",
        withdrawTx.txProps
      )
      mockMsgWithdraw.mockClear()
      await actionManager.send("memo", withdrawTx.txMetaData)
      expect(mockMsgWithdraw).toBeCalledTimes(5)

      expect(MsgSendFn).toHaveBeenCalledWith(
        {
          gas: "12335",
          gasPrices: [{ amount: "2000000000", denom: "uatom" }],
          memo: "memo"
        },
        "signer"
      )
    })
  })
})
