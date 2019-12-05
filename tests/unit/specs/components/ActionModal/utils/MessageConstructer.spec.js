import {
  getMessage,
  getMultiMessage
} from "src/ActionModal/utils/MessageConstructor.js"

const mockMultiMessage = jest.fn(() => ({
  simulate: jest.fn(),
  send: jest.fn()
}))

const mockCosmosMessage = jest.fn().mockImplementation(() => {
  return {
    MsgSend: mockMultiMessage,
    MultiMessage: mockMultiMessage
  }
})

jest.mock(`cosmos-apiV0`, () => ({
  default: mockCosmosMessage,
  createSignedTransaction: jest.fn(() => "signedMessage"),
  __esModule: true
}))
jest.mock(`cosmos-apiV2`, () => ({
  // default: mockCosmosMessage,
  createSignedTransaction: jest.fn(() => "signedMessage"),
  __esModule: true
}))

describe("MessageConstructor", () => {
  let context, messages

  it("should return message", async () => {
    context = {
      networkId: "cosmos-hub-mainnet"
    }

    const result = await getMessage("MsgSend", messages, context)
    expect(result.simulate).toBeDefined()
    expect(result.send).toBeDefined()
  })

  it("should throw error with incorrect network", async () => {
    context = {
      networkId: "does-not-exist"
    }
    await expect(getMessage("MsgSend", messages, context)).rejects.toThrow()
  })

  it("should return multi message", async () => {
    context = {
      networkId: "cosmos-hub-mainnet"
    }

    const result = await getMultiMessage(context, messages)
    expect(result.simulate).toBeDefined()
    expect(result.send).toBeDefined()
  })
})
