import ledgerModule from "modules/ledger.js"

describe(`Module: Ledger`, () => {
  let module, state, actions

  beforeEach(() => {
    module = ledgerModule()
    state = module.state
    actions = module.actions
  })

  describe(`Actions`, () => {
    describe(`connect ledger`, () => {
      it(`successfully logs in with Ledger Nano S`, async () => {
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

      it(`shows an outdated warning if the Ledger script calls it`, async () => {
        const commit = jest.fn()
        state.externals.Ledger = class MockLedger {
          constructor({ onOutdated }) {
            this.onOutdated = onOutdated
          }
          getCosmosAddress() {
            this.onOutdated()
            return "cosmos1"
          }
        }
        await expect(actions.connectLedgerApp({ commit, state }))
        expect(commit).toHaveBeenCalledWith(`notifyWarn`, expect.any(Object))
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
