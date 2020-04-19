import {
  getMessage,
  getSignedTransactionCreator
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
  let result

  it("should return message object for network", async () => {
    result = await getMessage("cosmos-hub-mainnet", "SendTx", "cosmos1234", {
      toAddress: "cosmos1456",
      amounts: [{ denom: "STAKE", amount: 12345 }]
    })

    expect(result).toMatchSnapshot()
  })

  it("should throw error with incorrect network", async () => {
    await expect(
      getMessage("non-existant", "SendTx", "cosmos1234", {
        toAddress: "cosmos1456",
        amounts: [{ denom: "STAKE", amount: 12345 }]
      })
    ).rejects.toThrow()
  })

  it("should return transaction signer", async () => {
    result = await getSignedTransactionCreator("cosmos")
    expect(result()).toBe("signedMessage")
  })

  it("should throw when getting a transaction signer for incorrect network", async () => {
    await expect(
      getSignedTransactionCreator("does-not-exist")
    ).rejects.toThrow()
  })
})
