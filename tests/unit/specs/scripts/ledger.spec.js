import { getAddressFromLedger, showAddressOnLedger } from "scripts/ledger.js"

jest.mock("src/../config", () => ({
  bech32Prefixes: {
    "cosmos-hub-mainnet": "cosmos"
  }
}))

jest.mock(
  `@lunie/cosmos-ledger`,
  () =>
    class mockLedger {
      constructor() {
        this.confirmLedgerAddress = jest.fn()
        this.getCosmosAddress = () => "cosmos1"
        this.cosmosApp = {
          transport: {
            close: jest.fn()
          }
        }
      }
    }
)

describe(`Ledger Connector`, () => {
  describe(`getAddressFromLedger`, () => {
    it(`successfully gets address from Ledger Nano`, async () => {
      const address = await getAddressFromLedger("cosmos-hub-mainnet")
      expect(address).toBe("cosmos1")
    })

    it(`handles errors`, async () => {
      jest.resetModules()
      jest.doMock(
        `@lunie/cosmos-ledger`,
        () =>
          class mockLedger {
            constructor() {
              this.confirmLedgerAddress = jest.fn()
              this.getCosmosAddress = () => {
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
      const { getAddressFromLedger } = require("scripts/ledger.js")
      await expect(getAddressFromLedger("cosmos-hub-mainnet")).rejects.toThrow(
        "XXX"
      )
    })
  })
  describe(`showAddressOnLedger`, () => {
    // shallow test as it doesn't test if this is doing anything.
    it(`shows address on Ledger Nano`, async () => {
      await showAddressOnLedger("cosmos-hub-mainnet")
    })

    it(`handles errors`, async () => {
      jest.resetModules()
      jest.doMock(
        `@lunie/cosmos-ledger`,
        () =>
          class mockLedger {
            constructor() {
              this.confirmLedgerAddress = () => {
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
      const { showAddressOnLedger } = require("scripts/ledger.js")
      await expect(showAddressOnLedger("cosmos-hub-mainnet")).rejects.toThrow(
        "XXX"
      )
    })
  })
})
