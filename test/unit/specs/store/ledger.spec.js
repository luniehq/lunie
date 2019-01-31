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
      const pubKey = Buffer.from([4, 228, 114, 95, 12])
      mutations.setLedgerPubKey(state, pubKey)
      expect(state.pubKey).toBe(pubKey)
    })

    it(`sets the account public key`, () => {
      const pubKeyFull = Buffer.from([0, 10, 11, 12, 13])
      mutations.setLedgerUncompressedPubKey(state, pubKeyFull)
      expect(state.uncompressedPubKey).toBe(pubKeyFull)
    })

    it(`updates the state if the device is connected`, () => {
      mutations.setLedgerConnection(state, true)
      expect(state.isConnected).toBe(true)
    })

    it(`sets an error`, () => {
      const error = `Sign/verify error`
      mutations.setLedgerError(state, error)
      expect(state.error).toBe(error)
    })
  })

  describe(`Actions`, () => {
    it(`resets the session data `, () => {
      state.isConnected = true
      const rootState = { ledger: state }
      actions.resetSessionData({ rootState })
      expect(rootState.ledger.isConnected).toBe(false)
    })

    describe(`checks for errors on Ledger actions`, () => {
      it(`sends a notification on error`, async () => {
        const commit = jest.fn()
        const response = { error_message: `Sign/verify error` }
        const title = `Signing transaction with Ledger failed`
        await actions.checkLedgerErrors({ commit }, { response, title })
        expect(commit).toHaveBeenCalledWith(`notifyError`, {
          title,
          body: `Sign/verify error`
        })
        expect(state.error).toBe(null)
      })

      it(`just returns on success`, async () => {
        const commit = jest.fn()
        const response = { error_message: `No errors` }
        const title = `This title shouldn't be notified to the user`
        actions.checkLedgerErrors({ commit }, { response, title })
        expect(commit).not.toHaveBeenCalledWith(`notifyError`, {
          title,
          body: `No errors`
        })
        expect(state.error).toBe(null)
      })
    })

    describe(`Ledger actions`, () => {
      let commit, dispatch
      beforeEach(() => {
        state.app = {
          get_version: jest.fn(async () => ({
            major: `0`,
            minor: `1`,
            patch: `0`,
            test_mode: false,
            error_message: `No errors`
          })),
          publicKey: jest.fn(async () => ({
            pk: Buffer.from([0]),
            compressed_pk: Buffer.from([1]),
            error_message: `No errors`
          })),
          sign: jest.fn(async () => ({
            signature: Buffer.from([0]),
            error_message: `No errors`
          }))
        }
        state.externals = {
          createCosmosAddress: jest.fn(() => `cosmos1address`),
          App: jest.fn(),
          comm_u2f: {
            create_async: jest.fn(async () => true)
          }
        }
        commit = jest.fn()
      })

      describe(`connect ledger`, () => {
        it(`successfully logs in with Ledger Nano S`, async () => {
          dispatch = jest.fn(async () => true)
          const ok = await actions.connectLedgerApp({ commit, dispatch, state })
          expect(state.externals.App).toHaveBeenCalled()
          expect(dispatch).toHaveBeenCalledWith(`getLedgerCosmosVersion`)
          expect(dispatch).toHaveBeenCalledWith(`getLedgerPubKey`)
          expect(dispatch).toHaveBeenCalledWith(`signIn`, {
            sessionType: `ledger`,
            address: `cosmos1address`
          })
          expect(commit).not.toHaveBeenCalledWith(`notifyError`, {
            title: `Error connecting to Ledger`,
            body: expect.anything()
          })
          expect(commit).not.toHaveBeenCalledWith(
            `setLedgerError`,
            expect.anything()
          )
          expect(ok).toBe(true)
        })

        it(`fails if one of the function throws`, async () => {
          dispatch = jest.fn(async () => Promise.reject({ message: `error` }))
          await actions.connectLedgerApp({ commit, dispatch, state })
          expect(commit).toHaveBeenCalledWith(`notifyError`, {
            title: `Error connecting to Ledger`,
            body: `error`
          })
          expect(commit).toHaveBeenCalledWith(`setLedgerError`, `error`)
        })
      })

      describe(`get_version`, () => {
        it(`gets and sets the version success`, async () => {
          const version = {
            major: `0`,
            minor: `1`,
            patch: `0`,
            test_mode: false
          }
          dispatch = jest.fn(async () => version)
          await actions.getLedgerCosmosVersion({ commit, dispatch, state })
          expect(commit).toHaveBeenCalledWith(`setLedgerCosmosVersion`, version)
        })

        it(`sets an error on failure`, async () => {
          const version = {
            major: undefined,
            minor: undefined,
            patch: undefined,
            test_mode: false
          }
          dispatch = jest.fn(async () => version)
          state.app.get_version = jest.fn(async () => ({
            major: undefined,
            minor: undefined,
            patch: undefined,
            test_mode: false,
            error_message: `Execution Error`
          }))
          await actions.getLedgerCosmosVersion({ commit, dispatch, state })
          expect(commit).not.toHaveBeenCalledWith(
            `setLedgerCosmosVersion`,
            version
          )
        })
      })

      describe(`publicKey`, () => {
        it(`gets and sets the account public Key on success`, async () => {
          const pubKey = Buffer.from([1])
          const uncompressedPubKey = Buffer.from([0])
          dispatch = jest.fn(async () => ({
            pk: Buffer.from([0]),
            compressed_pk: Buffer.from([1]),
            error_message: `No errors`
          }))
          await actions.getLedgerPubKey({ commit, dispatch, state })
          expect(commit).toHaveBeenCalledWith(`setLedgerPubKey`, pubKey)
          expect(commit).toHaveBeenCalledWith(
            `setLedgerUncompressedPubKey`,
            uncompressedPubKey
          )
        })

        it(`sets an error on failure`, async () => {
          const pubKey = Buffer.from([1])
          const uncompressedPubKey = Buffer.from([0])
          dispatch = jest.fn(async () => ({
            pk: undefined,
            compressed_pk: undefined,
            error_message: `Execution Error`
          }))
          await actions.getLedgerPubKey({ commit, dispatch, state })
          expect(commit).not.toHaveBeenCalledWith(`setLedgerPubKey`, pubKey)
          expect(commit).not.toHaveBeenCalledWith(
            `setLedgerUncompressedPubKey`,
            uncompressedPubKey
          )
        })
      })

      describe(`sign`, () => {
        it(`signs message succesfully`, async () => {
          const signature = Buffer.from([1])
          const msg = `{"account_number": 1,"chain_id": "some_chain","fee": {"amount": [{"amount": 10, "denom": "DEN"}],"gas": 5},"memo": "MEMO","msgs": ["SOMETHING"],"sequence": 3}`
          dispatch = jest.fn(async () => ({
            signature,
            error_message: `No errors`
          }))
          const resSignature = await actions.signWithLedger(
            { commit, dispatch, state },
            msg
          )
          expect(resSignature).toBe(signature)
        })

        it(`fails if message is not JSON`, async () => {
          const msg = `{"account_number": 1,"chain_id": "some_chain","fee": {"amount": [{"amount": 10, "denom": "DEN"}],"gas": 5},"memo": "MEMO","msgs": ["SOMETHING"],"sequence": 3}`
          dispatch = jest.fn(async () => ({
            signature: undefined,
            error_message: `Bad key handle`
          }))
          const resSignature = await actions.signWithLedger(
            { commit, dispatch, state },
            msg
          )
          expect(resSignature).toBeUndefined()
        })
      })
    })
  })
})
