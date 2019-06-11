import ledgerModule from "modules/ledger.js"

jest.mock("@lunie/cosmos-keys", () => ({}))

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
        state.externals.Ledger = class MockLedger {
          getCosmosAddress() {
            return "cosmos1"
          }
        }
        const res = await actions.connectLedgerApp({
          commit,
          state
        })
        expect(res).toBe("cosmos1")
      })

      it(`start the Ledger address confirmation process`, async () => {
        const spy = jest.fn()
        state.externals.Ledger = class MockLedger {
          async confirmLedgerAddress() {
            spy()
          }
        }
        // does not throw
        await actions.confirmLedgerAddress({
          state
        })
        expect(spy).toHaveBeenCalled()
      })
    })
  })
})
