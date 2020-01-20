import config from "src/../config"

describe("pick signer", () => {
  let getSigner
  beforeEach(() => {
    jest.resetModules()
    jest.doMock("@lunie/cosmos-keys", () => ({
      signWithPrivateKey: () => Buffer.alloc(0),
      getStoredWallet: () => ({
        privateKey: "1234",
        publicKey: "1234"
      })
    }))

    jest.doMock(
      `@lunie/cosmos-ledger`,
      () =>
        class mockLedger {
          constructor() {
            this.getKey = () => () => Buffer.alloc(0)
            this.getPubKey = () => Buffer.alloc(0)
            this.sign = () => Buffer.alloc(0)
            this.cosmosApp = {
              transport: {
                close: jest.fn()
              }
            }
          }
        }
    )

    jest.doMock(`scripts/extension-utils`, () => ({
      signWithExtension: jest.fn(() => ({
        signature: Buffer.alloc(0),
        publicKey: Buffer.alloc(0)
      }))
    }))

    const signer = require("src/ActionModal/utils/signer.js")
    getSigner = signer.getSigner
  })

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
  })

  it("should handle errors", async () => {
    jest.resetModules()
    jest.doMock(
      `@lunie/cosmos-ledger`,
      () =>
        class mockLedger {
          constructor() {
            this.getKey = () => () => Buffer.alloc(0)
            this.getPubKey = () => Buffer.alloc(0)
            this.sign = () => {
              throw new Error("XXX")
            }
            this.cosmosApp = {
              transport: {
                close: jest.fn()
              }
            }
          }
        }
    )
    const { getSigner } = require("src/ActionModal/utils/signer.js")

    const signer = await getSigner(config, "ledger", {
      address: "",
      password: "1234567890"
    })
    await expect(signer("message")).rejects.toThrow("XXX")
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
