import config from "src/../config"
import { getMessage } from "src/signing/message-creator"

describe("pick signer", () => {
  let getSigner, cancelSign, signQueue, getPolkadotLocalSigner
  beforeEach(() => {
    jest.resetModules()
    jest.doMock("@lunie/cosmos-keys", () => ({
      signWithPrivateKey: () => Buffer.from("cool signature"),
      getStoredWallet: () => ({
        privateKey: "1234",
        publicKey: "1234",
      }),
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
                close: jest.fn(),
              },
            }
          }
        }
    )

    jest.doMock(`scripts/extension-utils`, () => ({
      signWithExtension: jest.fn(() => ({
        signature: Buffer.alloc(0),
        publicKey: Buffer.alloc(0),
      })),
      cancelSignWithExtension: jest.fn(() => true),
      getSignQueue: jest.fn(() => true),
    }))

    const signer = require("src/signing/signer.js")
    getSigner = signer.getSigner
    cancelSign = signer.cancelSign
    signQueue = signer.signQueue
    getPolkadotLocalSigner = signer.getPolkadotLocalSigner
  })

  it("should should exist", () => {
    expect(getSigner).toBeDefined()
  })
  it("should call cancelSignWithExtension for an extension", async () => {
    const { cancelSignWithExtension } = require(`scripts/extension-utils`)
    await cancelSign(`extension`, {
      address: "",
      password: "1234567890",
    })
    expect(cancelSignWithExtension).toHaveBeenCalled()
  })
  it("should call getSignQueue for an extension", async () => {
    const { getSignQueue } = require(`scripts/extension-utils`)
    await signQueue(`extension`, {
      address: "",
      password: "1234567890",
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
          testnet: true,
        },
      },
      config
    )
    expect(signer("message")).toEqual({
      signature: "636f6f6c207369676e6174757265",
      publicKey: "1234",
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
          testnet: true,
        },
      },
      config
    )
    expect(await signer("message")).toEqual({
      signature: expect.any(Buffer),
      publicKey: expect.any(Buffer),
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
                close: jest.fn(),
              },
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
          testnet: true,
        },
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
          testnet: true,
        },
      },
      config
    )
    const { signWithExtension } = require(`scripts/extension-utils`)
    expect(await signer("message")).toEqual({
      signature: expect.any(Buffer),
      publicKey: expect.any(Buffer),
    })
    expect(signWithExtension).toHaveBeenCalled()
  })

  // this will connect to the actual API
  xit("should create signature for Polkadot", async () => {
    jest.setTimeout(60000)
    const nodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "production"
    try {
      const network = {
        id: "kusama",
        network_type: "polkadot",
        address_prefix: 2,
        testnet: false,
        coinLookup: [
          {
            viewDenom: "KSM",
            chainToViewConversionFactor: 1e-12,
            chainDenom: "Planck",
          },
        ],
      }
      const message = {
        to: ["DPpTYGsMbC1KELwDowaY2S1kEBpDjBAoaotPamfdXKdkYoG"],
        amount: {
          denom: "KSM",
          amount: 0.00001,
        },
      }
      const signer = await getPolkadotLocalSigner(
        {
          seedPhrase: `lunch primary know smoke track sustain parrot enact shock final rookie banana`,
        },
        network
      )
      const chainMessage = await getMessage(
        network,
        "SendTx",
        "DPpTYGsMbC1KELwDowaY2S1kEBpDjBAoaotPamfdXKdkYoG",
        message
      )
      const signedContext = await signer(chainMessage)

      expect(typeof signedContext.rawSignature).toBe("object") // can't test the value as it changes
    } finally {
      process.env.NODE_ENV = nodeEnv
    }
  })
})
