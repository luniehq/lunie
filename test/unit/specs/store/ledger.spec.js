import ledgerModule from "modules/ledger.js"

describe(`Module: Ledger`, () => {
  let module, state, actions, mutations

  beforeEach(() => {
    module = ledgerModule()
    state = module.state
    actions = module.actions
    mutations = module.mutations
  })

  describe(`Mutations`, () => {
    it(`sets the Cosmos Ledger app`, async () => {
      const app = {
        get_version: jest.fn(),
        publicKey: jest.fn(),
        sign: jest.fn()
      }
      mutations.setCosmosApp(state, app)
      expect(state.cosmosApp).toMatchObject(app)
    })

    it(`sets the Ledger cosmos app version`, () => {
      const version = { major: 0, minor: 1, patch: 1, test_mode: false }
      mutations.setCosmosAppVersion(state, version)
      expect(state.cosmosAppVersion).toMatchObject(version)
    })

    it(`sets the account public key`, () => {
      const pubKey = Buffer.from([4, 228, 114, 95, 12])
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
      it(`throws`, () => {
        const response = { error_message: `Sign/verify error` }
        expect(() => actions.checkLedgerErrors(response)).toThrow(
          response.error_message
        )
      })

      it(`just returns on success`, () => {
        const response = { error_message: `No errors` }
        expect(() => actions.checkLedgerErrors(response)).not.toThrow(
          response.error_message
        )
      })
    })

    describe(`Ledger actions`, () => {
      let commit, dispatch
      beforeEach(() => {
        state.cosmosApp = {
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
        dispatch = jest.fn(() => {
          state.cosmosAppVersion = {
            major: `0`,
            minor: `1`,
            patch: `0`
          }
        })
      })

      describe(`poll Ledger device`, () => {
        it(`when Ledger is connected and app is open`, async () => {
          state.externals.App = () => ({
            get_version: () =>
              Promise.resolve({
                error_message: `No errors`
              })
          })
          const response = await actions.pollLedgerDevice({ state })
          expect(response).toBe(``)
        })

        it(`when Ledger is connected but app is not open`, async () => {
          state.externals.App = () => ({
            get_version: () =>
              Promise.resolve({
                error_message: `Cosmos app does not seem to be open`
              })
          })
          const response = await actions.pollLedgerDevice({ state })
          expect(response).toBe(`Cøsmos app is not open`)
        })

        it(`when Ledger not connected`, async () => {
          state.externals.App = () => ({
            get_version: () =>
              Promise.resolve({
                error_message: `U2F: Timeout`
              })
          })
          const response = await actions.pollLedgerDevice({ state })
          expect(response).toBe(`No Ledger found`)
        })
      })

      describe(`create ledger app`, () => {
        it(`creates an instance of the app`, async () => {
          await actions.createLedgerAppInstance({ commit, state })
          expect(state.externals.comm_u2f.create_async).toHaveBeenCalled()
          expect(state.externals.App).toHaveBeenCalled()
          expect(commit).toHaveBeenCalledWith(`setCosmosApp`, {})
        })
      })

      describe(`connect ledger`, () => {
        it(`successfully logs in with Ledger Nano S`, async () => {
          dispatch = jest.fn(async () => Promise.resolve(``))
          const connectionError = await actions.connectLedgerApp({
            commit,
            dispatch,
            state
          })
          expect(dispatch).toHaveBeenCalledWith(`pollLedgerDevice`)
          expect(dispatch).toHaveBeenCalledWith(`createLedgerAppInstance`)
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
          expect(connectionError).toBe(``)
        })

        it(`fails if one of the function throws`, async () => {
          dispatch = jest.fn(async () => Promise.reject(new Error(`error`)))
          await actions.connectLedgerApp({ commit, dispatch, state })
          expect(commit).toHaveBeenCalledWith(`notifyError`, {
            title: `Error connecting to Ledger Nano S`,
            body: `error`
          })
          expect(commit).toHaveBeenCalledWith(`setLedgerError`, Error(`error`))
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
          await actions.getLedgerCosmosVersion({ commit, dispatch, state })
          expect(commit).toHaveBeenCalledWith(`setCosmosAppVersion`, version)
          expect(commit).not.toHaveBeenCalledWith(
            `setLedgerError`,
            expect.anything()
          )
        })

        it(`sets an error on failure`, async () => {
          const version = {
            major: undefined,
            minor: undefined,
            patch: undefined,
            test_mode: false
          }
          state.cosmosApp.get_version = jest.fn(async () =>
            Promise.reject(new Error(`Execution Error`))
          )
          await actions.getLedgerCosmosVersion({ commit, dispatch, state })
          expect(commit).not.toHaveBeenCalledWith(
            `setCosmosAppVersion`,
            version
          )
          expect(commit).toHaveBeenCalledWith(
            `setLedgerError`,
            Error(`Execution Error`)
          )
        })
      })

      describe(`publicKey`, () => {
        it(`gets and sets the account public Key on success`, async () => {
          const pubKey = Buffer.from([1])
          await actions.getLedgerPubKey({ commit, dispatch, state })
          expect(commit).toHaveBeenCalledWith(`setLedgerPubKey`, pubKey)
          expect(commit).not.toHaveBeenCalledWith(
            `setLedgerError`,
            expect.anything()
          )
        })

        it(`sets an error on failure`, async () => {
          const pubKey = Buffer.from([1])
          state.cosmosApp.publicKey = () =>
            Promise.resolve({
              error_message: `Bad key handle`
            })
          await actions.getLedgerPubKey({ commit, dispatch, state })
          expect(commit).not.toHaveBeenCalledWith(`setLedgerPubKey`, pubKey)
          expect(commit).toHaveBeenCalledWith(
            `setLedgerError`,
            Error(`Bad key handle`)
          )
        })
      })

      describe(`sign`, () => {
        it(`signs message succesfully`, async () => {
          const signature = Buffer.from([0])
          const msg = `{"account_number": 1,"chain_id": "some_chain","fee": {"amount": [{"amount": 10, "denom": "DEN"}],"gas": 5},"memo": "MEMO","msgs": ["SOMETHING"],"sequence": 3}`
          const resSignature = await actions.signWithLedger(
            { commit, dispatch, state },
            msg
          )
          expect(resSignature).toEqual(signature)
          expect(commit).not.toHaveBeenCalledWith(
            `setLedgerError`,
            expect.anything()
          )
        })

        it(`fails if message is not JSON`, async () => {
          const msg = `{"account_number": 1,"chain_id": "some_chain","fee": {"amount": [{"amount": 10, "denom": "DEN"}],"gas": 5},"memo": "MEMO","msgs": ["SOMETHING"],"sequence": 3}`
          state.cosmosApp.sign = () =>
            Promise.resolve({
              error_message: `Bad key handle`
            })
          const resSignature = await actions.signWithLedger(
            { commit, dispatch, state },
            msg
          )
          expect(resSignature).toBeUndefined()
          expect(commit).toHaveBeenCalledWith(
            `setLedgerError`,
            Error(`Bad key handle`)
          )
        })
      })
    })
  })
})
