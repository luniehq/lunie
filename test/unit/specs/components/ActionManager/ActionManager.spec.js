import ActionManager from "src/components/ActionManager/ActionManager.js"
import { sendTx, withdrawTx } from "./actions"

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
      MsgWithdrawDelegationReward: mockMsgWithdraw
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
      userAddress: "cosmos12345"
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
})
