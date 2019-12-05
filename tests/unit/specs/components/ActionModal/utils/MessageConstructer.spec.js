import {
  getMessage,
  getMultiMessage,
  getTransactionSigner
} from "src/ActionModal/utils/MessageConstructor.js"

const mockMessageObject = jest.fn(() => ({
  simulate: jest.fn(),
  send: jest.fn()
}))

const mockCosmosMessage = jest.fn().mockImplementation(() => {
  return {
    MsgSend: mockMessageObject,
    MultiMessage: mockMessageObject
  }
})

jest.mock(`cosmos-apiV0`, () => ({
  default: mockCosmosMessage,
  createSignedTransaction: jest.fn(() => "signedMessage"),
  __esModule: true
}))
jest.mock(`cosmos-apiV2`, () => ({
  default: mockCosmosMessage,
  createSignedTransaction: jest.fn(() => "signedMessage"),
  __esModule: true
}))

describe("MessageConstructor", () => {
  let context, messages, result

  it("should return message", async () => {
    result = await getMessage("MsgSend", messages, {
      networkId: "cosmos-hub-mainnet"
    })
    expect(result.simulate).toBeDefined()
    expect(result.send).toBeDefined()

    result = await getMessage("MsgSend", messages, {
      networkId: "local-cosmos-hub-testnet"
    })
    expect(result.simulate).toBeDefined()
    expect(result.send).toBeDefined()

    result = await getMessage("MsgSend", messages, {
      networkId: "cosmos-hub-testnet"
    })
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
    result = await getMultiMessage(
      { networkId: "cosmos-hub-mainnet" },
      messages
    )
    expect(result.simulate).toBeDefined()
    expect(result.send).toBeDefined()

    result = await getMultiMessage(
      { networkId: "local-cosmos-hub-testnet" },
      messages
    )
    expect(result.simulate).toBeDefined()
    expect(result.send).toBeDefined()

    result = await getMultiMessage(
      { networkId: "cosmos-hub-testnet" },
      messages
    )
    expect(result.simulate).toBeDefined()
    expect(result.send).toBeDefined()
  })

  it("should return undefined with incorrect network", async () => {
    const result = await getMultiMessage(
      { networkId: "does-not-exist" },
      messages
    )
    expect(result).not.toBeDefined()
  })

 it("should return transaction signer", async () => {
    result = await getTransactionSigner(
      { networkId: "cosmos-hub-mainnet" },
      messages
    )
    expect(result()).toBe("signedMessage")

    result = await getTransactionSigner(
      { networkId: "local-cosmos-hub-testnet" },
      messages
    )
    expect(result()).toBe("signedMessage")

    result = await getTransactionSigner(
      { networkId: "cosmos-hub-testnet" },
      messages
    )
    expect(result()).toBe("signedMessage")
  })

  it("should throw when getting a transaction signer for incorrect network", async () => {
    await expect(
      getTransactionSigner( { networkId: "does-not-exist" })
    ).rejects.toThrow()
  })  
})
