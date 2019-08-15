import config from "src/config"
import { getSigner } from "src/ActionModal/utils/signer.js"

jest.mock("@lunie/cosmos-keys", () => ({
  signWithPrivateKey: () => Buffer.alloc(0),
  getStoredWallet: () => ({
    privateKey: "1234",
    publicKey: "1234"
  })
}))

jest.mock(
  `@lunie/cosmos-ledger`,
  () =>
    class mockLedger {
      constructor() {
        this.getKey = () => () => Buffer.alloc(0)
        this.getPubKey = () => Buffer.alloc(0)
        this.sign = () => Buffer.alloc(0)
      }
    }
)

jest.mock(`scripts/extension-utils`, () => ({
  signWithExtension: jest.fn(() => ({
    signature: Buffer.alloc(0),
    publicKey: Buffer.alloc(0)
  }))
}))

describe("pick signer", () => {
  it("should should exist", () => {
    expect(getSigner).toBeDefined()
  })
  it("should pick a local signer", async () => {
    const signer = await getSigner(config, "local", {
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
    const signer = await getSigner(config, "ledger", {
      address: "",
      password: "1234567890"
    })
    expect(await signer("message")).toEqual({
      signature: expect.any(Buffer),
      publicKey: expect.any(Buffer)
    })
    // expect(ledgerMock.sign).toHaveBeenCalledWith("message")
  })

  it("should pick the extension signer", async () => {
    const signer = await getSigner(config, "extension", {
      address: ""
    })
    const { signWithExtension } = require(`scripts/extension-utils`)
    expect(await signer("message")).toEqual({
      signature: expect.any(Buffer),
      publicKey: expect.any(Buffer)
    })
    expect(signWithExtension).toHaveBeenCalled()
  })
})
