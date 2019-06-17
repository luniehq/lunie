import ActionManager from "src/components/ActionManager/ActionManager.js"
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

jest.mock(`@lunie/cosmos-js`, () => {
  return jest.fn().mockImplementation(() => {
    return {
      get: mockGet,
      MsgSend: mockMsgSend,
      MsgWithdrawDelegationReward: mockMsgWithdraw,
      MultiMessage: mockMultiMessage
    }
  })
})

jest.mock(`src/components/ActionManager/signer.js`, () => ({
  getSigner: jest.fn(() => "signer")
}))

let actionManager
describe("ActionManager", () => {
  beforeEach(() => {
    actionManager = new ActionManager()
    actionManager.setContext({
      url: "blah",
      chainId: "cosmos",
      connected: true,
      userAddress: "cosmos12345",
      totalRewards: 1234,
      rewards: {
        address1: { uatom: 100 },
        address2: { uatom: 1 },
        address3: { uatom: 5 },
        address4: { uatom: 3 },
        address5: { uatom: 0 },
        address6: { uatom: 99 },
        address7: { uatom: 9 },
        address8: { uatom: 96 },
        address9: { uatom: 98 },
        address10: { uatom: 97 }
      }
    })
  })

  it("should be created", () => {
    expect(actionManager instanceof ActionManager).toBe(true)
  })

  it("should set context", () => {
    const context = {
      url: "blah",
      chainId: "cosmos",
      connected: true
    }
    expect(actionManager.setContext(context))
    expect(actionManager.cosmos)
    expect(actionManager.context).toEqual({
      url: "blah",
      chainId: "cosmos",
      connected: true
    })
  })

  it("should throw if setting empty context", () => {
    try {
      actionManager.setContext()
    } catch (e) {
      expect(e).toEqual(Error("Context cannot be empty"))
    }
  })

  it("should throw if not connected", () => {
    try {
      actionManager = new ActionManager()
      actionManager.setContext({
        url: "blah",
        chainId: "cosmos",
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

  it("should throw if setting message with empty context", () => {
    try {
      actionManager = new ActionManager()
      actionManager.setMessage("MsgSend", sendTx.txProps)
    } catch (e) {
      expect(e).toEqual(Error("This modal has no context."))
    }
  })

  describe("simulating and sending", () => {
    beforeEach(() => {
      const context = {
        url: "blah",
        chainId: "cosmos",
        connected: true,
        userAddress: "cosmos12345",
        totalRewards: 1234,
        bondDenom: "uatom",
        rewards: {
          address1: { uatom: 100 },
          address2: { uatom: 1 },
          address3: { uatom: 5 },
          address4: { uatom: 3 },
          address5: { uatom: 0 },
          address6: { uatom: 99 },
          address7: { uatom: 9 },
          address8: { uatom: 96 },
          address9: { uatom: 98 },
          address10: { uatom: 97 }
        }
      }
      actionManager.setContext(context)
      actionManager.setMessage("MsgSend", sendTx.txProps)
    })

    it("should create message", () => {
      actionManager.setMessage("MsgSend", sendTx.txProps)
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
        connected: true
      }
      actionManager.setContext(context)
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
          gas_prices: [{ amount: "2000000000", denom: "uatom" }],
          memo: "memo"
        },
        "signer"
      )
    })

    it("should create multimessage", async () => {
      actionManager.setMessage(
        "MsgWithdrawDelegationReward",
        withdrawTx.txProps
      )
      mockMsgWithdraw.mockClear()
      await actionManager.send("memo", withdrawTx.txMetaData)
      expect(mockMsgWithdraw).toBeCalledTimes(5)

      expect(MsgSendFn).toHaveBeenCalledWith(
        {
          gas: "12335",
          gas_prices: [{ amount: "2000000000", denom: "uatom" }],
          memo: "memo"
        },
        "signer"
      )
    })
  })
})
