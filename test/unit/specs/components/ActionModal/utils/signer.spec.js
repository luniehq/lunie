import config from "src/config"
import { getSigner } from "src/ActionModal/utils/signer.js"

jest.mock("@lunie/cosmos-keys", () => ({
  signWithPrivateKey: () => Buffer.alloc(0),
  getStoredWallet: () => ({
    privateKey: "1234",
    publicKey: "1234"
  })
}))

jest.mock(`@lunie/cosmos-ledger`, () => {
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
      address: "",
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
      address: "",
      password: "1234567890"
    })
    expect(await signer("message")).toEqual({
      signature: expect.any(Buffer),
      publicKey: expect.any(Buffer)
    })
    // expect(ledgerMock.sign).toHaveBeenCalledWith("message")
  })
})
