import ledgerModule from "modules/ledger.js"
import { App, comm_u2f } from "ledger-cosmos-js"

describe(`Module: Ledger`, () => {
  let module, state, actions, mutations

  beforeEach(() => {
    module = ledgerModule()
    state = module.state
    actions = module.actions
    mutations = module.mutations
  })

  describe(`Mutations`, () => {
    it(`sets the Ledger app`, async () => {
      const comm = await comm_u2f.create_async(5, true)
      const app = new App(comm)
      mutations.setLedger(state, app)
      expect(state.app).toMatchObject(app)
    })

    it(`sets the Ledger cosmos app version`, () => {
      const version = { major: 0, minor: 1, patch: 1, test_mode: false }
      mutations.setLedgerCosmosVersion(state, version)
      expect(state.version).toMatchObject(version)
    })

    it(`sets the account public key`, () => {
      const pubKey = new Uint8Array([95, 12, 248, 233, 150, 121])
      mutations.setLedgerPubKey(state, pubKey)
      expect(state.pubKey).toBe(pubKey)
    })

    it(`updates the state if the device is connected`, () => {
      mutations.setLedgerConnection(state, true)
      expect(state.isConnected).toBe(true)
    })

    it(`sets an error`, () => {
      const error = `Sign/verify error`
      mutations.setLedgerError(state, error)
      expect(state.isConnected).toBe(error)
    })
  })

  describe(`Actions`, () => {
    it(`resets the session data `, () => {
      state.isConnected = true
      actions.resetSessionData({ state })
      expect(state.nonce).toBe(false)
    })

    describe(`checks for errors on Ledger actions`, () => {
      it(`sends a notification on error`, async () => {
        const commit = jest.fn()
        const response = { error_message: `Sign/verify error` }
        const title = `Signing transaction with Ledger failed`
        await actions.checkLedgerErrors({ commit }, response, title)
        expect(commit).toHaveBeenCalledWith(`notifyError`, {
          title,
          body: response.error_message
        })
        expect(state.error).toBe(response.error_message)
      })

      it(`just returns on success`, async () => {
        const commit = jest.fn()
        const response = { error_message: `No errors` }
        const title = `This title shouldn't be notified to the user`
        await actions.checkLedgerErrors({ commit }, response, title)
        expect(commit).not.toHaveBeenCalledWith(`notifyError`, {
          title,
          body: response.error_message
        })
        expect(state.error).toBe(null)
      })
    })

    // describe(`Ledger actions`, () => {
    //   beforeEach(async () => {
    //     const comm = await comm_u2f.create_async(2, true)
    //     const app = new App(comm)
    //     state.app = app
    //   })

    //   describe(`get_version`, () => {
    //     it(`gets and sets the version success`, async () => {
    //       const commit = jest.fn()
    //       const dispatch = jest.fn()
    //       actions.getLedgerCosmosVersion({ commit, dispatch, state })
    //       expect(commit.mock.calls).toContain([`setLedgerCosmosVersion`])
    //       expect(commit.mock.calls).not.toContain([`notifyError`])
    //     })

    //     it(`sets an error on failure`, async () => {
    //       const commit = jest.fn()
    //       const dispatch = jest.fn()
    //       await actions.getLedgerCosmosVersion({ commit, dispatch, state })
    //       expect(commit.mock.calls).not.toContain([`setLedgerCosmosVersion`])
    //       expect(commit.mock.calls).toContain([`notifyError`])
    //     })
    //   })

    //   describe(`publicKey`, () => {
    //     it(`gets and sets the account public Key on success`, async () => {
    //       const commit = jest.fn()
    //       const dispatch = jest.fn()
    //       await actions.getLedgerPubKey({ commit, dispatch, state })
    //       expect(commit.mock.calls).toContain([`setLedgerPubKey`])
    //       expect(commit.mock.calls).not.toContain([`notifyError`])
    //     })

    //     it(`sets an error on failure`, async () => {
    //       const commit = jest.fn()
    //       const dispatch = jest.fn()
    //       await actions.getLedgerPubKey({ commit, dispatch, state })
    //       expect(commit.mock.calls).not.toContain([`setLedgerPubKey`])
    //       expect(commit.mock.calls).toContain([`notifyError`])
    //     })
    //   })
    // })
  })
})
