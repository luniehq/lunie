import {
  getMessage,
  signedTransactionCreator
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

  it("should return message object for network", async () => {
    result = await getMessage("cosmos-hub-mainnet", "MsgSend", "cosmos1234", {
      toAddress: "cosmos1456",
      amounts: [{ denom: "STAKE", amount: 12345 }]
    })

    expect(result).toMatchSnapshot()
  })

  it("should throw error with incorrect network", async () => {
    context = {
      networkId: "does-not-exist"
    }
    await expect(getMessage("MsgSend", messages, context)).rejects.toThrow()
  })

  it("should return transaction signer", async () => {
    result = await signedTransactionCreator(
      { networkId: "cosmos-hub-mainnet" },
      messages
    )
    expect(result()).toBe("signedMessage")

    result = await signedTransactionCreator(
      { networkId: "local-cosmos-hub-testnet" },
      messages
    )
    expect(result()).toBe("signedMessage")

    result = await signedTransactionCreator(
      { networkId: "cosmos-hub-testnet" },
      messages
    )
    expect(result()).toBe("signedMessage")
  })

  it("should throw when getting a transaction signer for incorrect network", async () => {
    await expect(
      signedTransactionCreator({ networkId: "does-not-exist" })
    ).rejects.toThrow()
  })
})
