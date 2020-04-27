import config from "src/../config"

describe("pick signer", () => {
  let getSigner, cancelSign, signQueue
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
      })),
      cancelSignWithExtension: jest.fn(() => true),
      getSignQueue: jest.fn(() => true)
    }))

    const signer = require("src/signing/signer.js")
    getSigner = signer.getSigner
    cancelSign = signer.cancelSign
    signQueue = signer.signQueue
  })

  it("should should exist", () => {
    expect(getSigner).toBeDefined()
  })
  it("should call cancelSignWithExtension for an extension", async () => {
    const { cancelSignWithExtension } = require(`scripts/extension-utils`)
    await cancelSign(`extension`, {
      address: "",
      password: "1234567890"
    })
    expect(cancelSignWithExtension).toHaveBeenCalled()
  })
  it("should call getSignQueue for an extension", async () => {
    const { getSignQueue } = require(`scripts/extension-utils`)
    await signQueue(`extension`, {
      address: "",
      password: "1234567890"
    })
    expect(getSignQueue).toHaveBeenCalled()
  })
  it("should pick a local signer", async () => {
    const signer = await getSigner(
      "local",
      {
        address: "",
        password: "1234567890",
        network: {
          id: "cosmos-hub-testnet",
          network_type: "cosmos",
          address_prefix: "cosmos",
          testnet: true
        }
      },
      config
    )
    expect(signer("message")).toEqual({
      signature: expect.any(Buffer),
      publicKey: expect.any(Buffer)
    })
  })

  it("should pick a ledger signer", async () => {
    const signer = await getSigner(
      "ledger",
      {
        address: "",
        password: "1234567890",
        network: {
          id: "cosmos-hub-testnet",
          network_type: "cosmos",
          address_prefix: "cosmos",
          testnet: true
        }
      },
      config
    )
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
    const { getSigner } = require("src/signing/signer.js")

    const signer = await getSigner(
      "ledger",
      {
        address: "",
        password: "1234567890",
        network: {
          id: "cosmos-hub-testnet",
          network_type: "cosmos",
          address_prefix: "cosmos",
          testnet: true
        }
      },
      config
    )
    await expect(signer("message")).rejects.toThrow("XXX")
  })

  it("should pick the extension signer", async () => {
    const signer = await getSigner(
      "extension",
      {
        address: "",
        network: {
          id: "cosmos-hub-testnet",
          network_type: "cosmos",
          address_prefix: "cosmos",
          testnet: true
        }
      },
      config
    )
    const { signWithExtension } = require(`scripts/extension-utils`)
    expect(await signer("message")).toEqual({
      signature: expect.any(Buffer),
      publicKey: expect.any(Buffer)
    })
    expect(signWithExtension).toHaveBeenCalled()
  })
})
