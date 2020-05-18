import { getMessage } from "src/signing/message-creator.js"

describe("Message Creator", () => {
  let result

  it("should return message object for network", async () => {
    result = await getMessage(
      {
        id: "cosmos-hub-mainnet",
        coinLookup: [
          {
            viewDenom: "STAKE",
            chainDenom: "ustake",
            chainToViewConversionFactor: 100000,
          },
        ],
      },
      "SendTx",
      "cosmos1234",
      {
        to: ["cosmos1456"],
        amount: { denom: "STAKE", amount: 12345 },
      }
    )

    expect(result).toMatchSnapshot()
  })

  it("should throw error with incorrect network", async () => {
    await expect(
      getMessage({ id: "non-existant" }, "SendTx", "cosmos1234", {
        to: ["cosmos1456"],
        amount: { denom: "STAKE", amount: 12345 },
      })
    ).rejects.toThrow()
  })
})
