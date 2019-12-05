import ledgerModule from "modules/ledger.js"

jest.mock("@lunie/cosmos-keys", () => ({}))

jest.mock(
  `@lunie/cosmos-ledger`,
  () =>
    class mockLedger {
      constructor() {
        this.getCosmosAddress = () => "cosmos1"
        this.cosmosApp = {
          transport: {
            close: jest.fn()
          }
        }
      }
    }
)

describe(`Module: Ledger`, () => {
  let module, state, actions

  beforeEach(() => {
    module = ledgerModule()
    state = module.state
    actions = module.actions
  })

  describe(`Actions`, () => {
    describe(`connect ledger`, () => {
      it(`successfully logs in with Ledger Nano`, async () => {
        const commit = jest.fn()
        const res = await actions.connectLedgerApp({
          commit,
          state
        })
        expect(res).toBe("cosmos1")
      })

      it(`handles errors`, async () => {
        jest.resetModules()
        jest.doMock(
          `@lunie/cosmos-ledger`,
          () =>
            class mockLedger {
              constructor() {
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
        const commit = jest.fn()
        const ledgerModule = require("modules/ledger.js").default
        const module = ledgerModule()
        actions = module.actions
        await expect(
          actions.connectLedgerApp({
            commit,
            state
          })
        ).rejects.toThrow("XXX")
      })
    })
  })
})
