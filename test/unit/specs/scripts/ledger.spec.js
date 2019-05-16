import Ledger from "scripts/ledger.js"

jest.mock("secp256k1", () => ({
  signatureImport: () => Buffer.from("1234")
}))

const config = {
  testModeAllowed: false,
  onOutdated: () => {}
}

describe(`Ledger`, () => {
  let ledger
  beforeEach(() => {
    ledger = new Ledger(config)
  })

  it(`constructor`, () => {
    expect(ledger.checkLedgerErrors).toBeDefined()
    expect(ledger.testModeAllowed).toBe(false)
    expect(ledger.onOutdated).toBeDefined()
  })

  it("testDevice", async () => {
    const self = {
      connect: jest.fn()
    }
    const onOutdated = "1234"
    await ledger.testDevice.call(self, onOutdated)
    expect(self.connect).toHaveBeenCalledWith(3, onOutdated)
  })

  it("isSendingData", async () => {
    const self = {
      checkLedgerErrors: jest.fn(),
      cosmosApp: {
        publicKey: jest.fn(() => ({
          error_message: "No errors"
        }))
      }
    }
    await ledger.isSendingData.call(self)
    expect(ledger.checkLedgerErrors).toBeDefined()
    expect(self.cosmosApp.publicKey).toHaveBeenCalled()
  })

  describe("isReady", () => {
    it("oldVersion", async () => {
      const self = {
        getCosmosAppVersion: () => "1.1.0",
        onOutdated: jest.fn()
      }
      await ledger.isReady.call(self)
      expect(self.onOutdated).toHaveBeenCalledWith("1.1.0", "1.5.0")
    })

    it("newVersion", async () => {
      const self = {
        getCosmosAppVersion: () => "1.5.0",
        isCosmosAppOpen: jest.fn()
      }
      await ledger.isReady.call(self)
      expect(self.isCosmosAppOpen).toHaveBeenCalled()
    })
  })

  describe("connect", () => {
    jest.doMock("ledger-cosmos-js", () => ({
      App: class MockApp {},
      comm_u2f: {
        create_async: () => ({})
      }
    }))

    it("connects", async () => {
      const self = {
        isSendingData: jest.fn(),
        isReady: jest.fn()
      }
      await ledger.connect.call(self)
      expect(self.cosmosApp).toBeDefined()
      expect(self.isSendingData).toHaveBeenCalled()
      expect(self.isReady).toHaveBeenCalled()
    })

    it("uses existing connection", async () => {
      const self = {
        isSendingData: jest.fn(),
        isReady: jest.fn(),
        cosmosApp: {}
      }
      await ledger.connect.call(self)
      expect(self.cosmosApp).toBeDefined()
      expect(self.isSendingData).not.toHaveBeenCalled()
      expect(self.isReady).not.toHaveBeenCalled()
    })
  })

  describe("getCosmosAppVersion", () => {
    it("new version", async () => {
      const self = {
        connect: jest.fn(),
        cosmosApp: {
          get_version: () => ({
            major: "1",
            minor: "5",
            patch: "0",
            test_mode: false
          })
        },
        checkLedgerErrors: jest.fn()
      }
      const res = await ledger.getCosmosAppVersion.call(self)
      expect(self.connect).toHaveBeenCalled()
      expect(self.checkLedgerErrors).toHaveBeenCalled()
      expect(res).toBe("1.5.0")
    })

    it("old version", async () => {
      const self = {
        connect: jest.fn(),
        cosmosApp: {
          get_version: () => ({
            major: "1",
            minor: "1",
            patch: "0",
            test_mode: false,
            error_message: "No errors"
          })
        },
        checkLedgerErrors: jest.fn()
      }
      await expect(ledger.getCosmosAppVersion.call(self)).rejects.toThrow()
      expect(self.connect).toHaveBeenCalled()
      expect(self.checkLedgerErrors).toHaveBeenCalled()
    })

    it("test mode", async () => {
      const self = {
        connect: jest.fn(),
        cosmosApp: {
          get_version: () => ({
            major: "1",
            minor: "5",
            patch: "0",
            test_mode: true,
            error_message: "No errors"
          })
        },
        checkLedgerErrors: jest.fn()
      }
      await expect(ledger.getCosmosAppVersion.call(self)).rejects.toThrow()
      expect(self.connect).toHaveBeenCalled()
      expect(self.checkLedgerErrors).toHaveBeenCalled()
    })
  })

  describe("isCosmosAppOpen", () => {
    it("success", async () => {
      const self = {
        connect: jest.fn(),
        cosmosApp: {
          appInfo: () => ({
            appName: "Cosmos",
            error_message: "No errors"
          })
        },
        checkLedgerErrors: jest.fn()
      }
      await ledger.isCosmosAppOpen.call(self)
      expect(self.connect).toHaveBeenCalled()
      expect(self.checkLedgerErrors).toHaveBeenCalled()
    })

    it("failure", async () => {
      const self = {
        connect: jest.fn(),
        cosmosApp: {
          appInfo: () => ({
            appName: "Ethereum",
            error_message: "No errors"
          })
        },
        checkLedgerErrors: jest.fn()
      }
      await expect(ledger.isCosmosAppOpen.call(self)).rejects.toThrow()
      expect(self.connect).toHaveBeenCalled()
      expect(self.checkLedgerErrors).toHaveBeenCalled()
    })
  })

  it("getCosmosAddress", async () => {
    const self = {
      connect: jest.fn(),
      getPubKey: jest.fn(() => Buffer.from("1234"))
    }
    const res = await ledger.getCosmosAddress.call(self)
    expect(self.connect).toHaveBeenCalled()
    expect(res).toBe("cosmos1l4aqmqyen0kawmy6pq5q27qhl3synfg8uqcsa5")
  })

  it("getPubKey", async () => {
    const self = {
      connect: jest.fn(),
      checkLedgerErrors: jest.fn(),
      cosmosApp: {
        publicKey: () => ({
          compressed_pk: Buffer.from("1234"),
          error_message: "No errors"
        })
      }
    }
    const res = await ledger.getPubKey.call(self)
    expect(self.connect).toHaveBeenCalled()
    expect(self.checkLedgerErrors).toHaveBeenCalled()
    expect(res instanceof Buffer).toBe(true)
  })

  describe("confirmLedgerAddress", () => {
    it("new version", async () => {
      const self = {
        checkLedgerErrors: jest.fn(),
        connect: jest.fn(),
        getCosmosAppVersion: () => "1.5.0",
        cosmosApp: {
          getAddressAndPubKey: jest.fn(() => ({
            error_message: "No errors"
          }))
        }
      }
      await ledger.confirmLedgerAddress.call(self)
      expect(self.connect).toHaveBeenCalled()
      expect(self.checkLedgerErrors).toHaveBeenCalled()
      expect(self.cosmosApp.getAddressAndPubKey).toHaveBeenCalled()
    })

    it("old version", async () => {
      const self = {
        checkLedgerErrors: jest.fn(),
        connect: jest.fn(),
        getCosmosAppVersion: () => "1.1.0",
        cosmosApp: {
          getAddressAndPubKey: jest.fn(() => ({
            error_message: "No errors"
          }))
        }
      }
      await ledger.confirmLedgerAddress.call(self)
      expect(self.connect).toHaveBeenCalled()
      expect(self.checkLedgerErrors).not.toHaveBeenCalled()
      expect(self.cosmosApp.getAddressAndPubKey).not.toHaveBeenCalled()
    })
  })

  it("sign", async () => {
    const self = {
      checkLedgerErrors: jest.fn(),
      connect: jest.fn(),
      getCosmosAppVersion: () => "1.1.0",
      cosmosApp: {
        sign: jest.fn(() => ({
          signature: Buffer.from("1234"), // needs to be a DER signature, but the upstream library is mockeed here
          error_message: "No errors"
        }))
      }
    }
    const res = await ledger.sign.call(self, "message")
    expect(self.connect).toHaveBeenCalled()
    expect(self.checkLedgerErrors).toHaveBeenCalled()
    expect(self.cosmosApp.sign).toHaveBeenCalledWith(
      expect.any(Array),
      "message"
    )
    expect(res instanceof Buffer).toBe(true)
  })

  describe("checkLedgerErrors", () => {
    it("throws an error if the device is locked", () => {
      expect(() =>
        ledger.checkLedgerErrors({ error_message: "", device_locked: true })
      ).toThrow("Ledger's screensaver mode is on")
    })

    it("doesn't throw on no error message", () => {
      expect(() =>
        ledger.checkLedgerErrors({
          error_message: "No errors",
          device_locked: false
        })
      ).not.toThrow
    })
  })
})
