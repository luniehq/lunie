import config from "src/config"
import { getSigner } from "src/components/ActionManager/signer.js"

jest.mock(`scripts/keystore.js`, () => ({
  getKey: () => ({
    cosmosAddress: `cosmos1r5v5srda7xfth3hn2s26txvrcrntldjumt8mhl`,
    privateKey: `8088c2ed2149c34f6d6533b774da4e1692eb5cb426fdbaef6898eeda489630b7`,
    publicKey: `02ba66a84cf7839af172a13e7fc9f5e7008cb8bca1585f8f3bafb3039eda3c1fdd`
  })
}))

jest.mock("@lunie/cosmos-keys", () => ({
  signWithPrivateKey: () => Buffer.alloc(0)
}))

jest.mock(`scripts/ledger.js`, () => {
  return jest.fn().mockImplementation(() => {
    return {
      getKey: () => () => Buffer.alloc(0),
      getPubKey: () => Buffer.alloc(0),
      sign: () => Buffer.alloc(0)
    }
  })
})

describe("pick signer", () => {
  it("should should exist", () => {
    expect(getSigner).toBeDefined()
  })
  it("should pick a local signer", () => {
    const signer = getSigner(config, "local", {
      localKeyPairName: "",
      password: "1234567890"
    })
    expect(signer("message")).toEqual({
      signature: expect.any(Buffer),
      publicKey: expect.any(Buffer)
    })
    // expect(signWithPrivateKey).toHaveBeenCalledWith(
    //   "message",
    //   expect.any(Buffer)
    // )
  })

  it("should pick a ledger signer", async () => {
    const signer = getSigner(config, "ledger", {
      localKeyPairName: "",
      password: "1234567890"
    })
    expect(await signer("message")).toEqual({
      signature: expect.any(Buffer),
      publicKey: expect.any(Buffer)
    })
    // expect(ledgerMock.sign).toHaveBeenCalledWith("message")
  })
})
