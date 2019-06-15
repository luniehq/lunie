import ActionManager from "src/components/ActionManager/ActionManager.js"
import { sendTx, withdrawTx, withdrawManyTx } from "./actions"

let mockSimulate = jest.fn(() => 12345)
const MsgSendFn = jest.fn(() => ({ included: () => async () => true }))
const mockGet = jest.fn()
const mockMsgSend = jest.fn(() => ({
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
      MultiMessage: mockMsgSend
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
      committedDelegations: {
        address1: 100,
        address2: 1,
        address3: 5,
        address4: 3,
        address5: 0,
        address6: 99,
        address7: 9,
        address8: 96,
        address9: 98,
        address10: 97
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

  it("should throw if setting empty context", () => {
    try {
      actionManager = new ActionManager()
      actionManager.readyCheck()
    } catch (e) {
      expect(e).toEqual(Error("This modal has no context."))
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

  it("should throw if simulating without message type", async () => {
    expect.assertions(1)
    try {
      await actionManager.simulate()
    } catch (e) {
      expect(e).toEqual(Error("No message type present."))
    }
  })

  it("should throw if simulating with incorrect message type", async () => {
    expect.assertions(1)
    try {
      await actionManager.simulate("xxxxx")
    } catch (e) {
      expect(e).toEqual(Error("Invalid message type: xxxxx."))
    }
  })

  it("should return gas estimate", async () => {
    mockSimulate = jest.fn(() => 123)
    const data = await actionManager.simulate("MsgSend", "memo", sendTx.txProps)
    expect(data).toEqual(123)
  })

  it("should set Withdraw type validatorAddress to empty array when simulating", async () => {
    mockSimulate = jest.fn(() => 123)
    const data = await actionManager.simulate(
      "MsgWithdrawDelegationReward",
      "memo",
      withdrawTx.txProps
    )
    expect(data).toEqual(123)
    expect(mockMsgWithdraw).toHaveBeenCalledWith("cosmos12345", {
      validatorAddress: []
    })
  })

  it("should send", async () => {
    const result = await actionManager.send(
      "MsgSend",
      "memo",
      sendTx.txProps,
      sendTx.txMetaData
    )
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
    const result = await actionManager.send(
      "MsgWithdrawDelegationReward",
      "memo",
      withdrawManyTx.txProps,
      withdrawManyTx.txMetaData
    )
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

  it("should create single message when withdrawing from a single validator", async () => {
    const result = await actionManager.send(
      "MsgWithdrawDelegationReward",
      "memo",
      withdrawTx.txProps,
      withdrawTx.txMetaData
    )
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
})
