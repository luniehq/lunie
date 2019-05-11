import ledgerModule, { checkLedgerErrors } from "modules/ledger.js"

describe(`Module: Ledger`, () => {
  let module, state, actions, mutations

  const mockRootState = {
    connection: {
      lastHeader: {
        chain_id: "cosmoshub-2"
      }
    }
  }

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
  })

  describe(`Actions`, () => {
    it(`resets the session data `, () => {
      state.isConnected = true
      const rootState = { ledger: state }
      actions.resetSessionData({ rootState })
      expect(rootState.ledger.isConnected).toBe(false)
    })

    describe(`checks for errors on Ledger actions`, () => {
      it(`throws with an error`, () => {
        const response = { error_message: `Sign/verify error` }
        expect(() => checkLedgerErrors({}, response)).toThrowError(
          response.error_message
        )
      })

      it(`throws on rejected transaction`, () => {
        const response = { error_message: `Command not allowed` }
        expect(() => checkLedgerErrors({}, response)).toThrowError(
          `Transaction rejected`
        )
      })

      it(`just returns on success`, () => {
        const response = { error_message: `No errors` }
        expect(() => checkLedgerErrors({}, response)).not.toThrow(
          response.error_message
        )
      })

      it(`checks if device is locked`, () => {
        const response = { error_message: `No errors`, device_locked: true }
        expect(() => checkLedgerErrors({}, response)).toThrow(
          `Ledger's screensaver mode is on`
        )
      })
    })

    describe(`Ledger actions`, () => {
      let commit, dispatch
      beforeEach(() => {
        state.cosmosApp = {
          get_version: jest.fn(async () => ({
            major: `1`,
            minor: `0`,
            patch: `1`,
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
          },
          config: {
            requiredCosmosAppVersion: "1.5.0"
          }
        }
        commit = jest.fn()
        dispatch = jest.fn()
      })

      describe(`poll Ledger device`, () => {
        it(`when Ledger is connected and app is open`, async () => {
          state.externals.App = () => ({
            publicKey: () =>
              Promise.resolve({
                error_message: `No errors`
              })
          })
          expect(
            async () =>
              await actions.pollLedgerDevice({ state, commit, dispatch })
          ).not.toThrow()
        })

        it(`when Ledger is connected but app is not open`, async () => {
          state.externals.App = () => ({
            publicKey: () =>
              Promise.resolve({
                error_message: `Cosmos app does not seem to be open`
              })
          })
          await expect(
            actions.pollLedgerDevice({ state, commit, dispatch })
          ).rejects.toThrow(`Cosmos app is not open`)
        })

        it(`when Ledger not connected`, async () => {
          state.externals.App = () => ({
            publicKey: () =>
              Promise.resolve({
                error_message: `U2F: Timeout`
              })
          })
          await expect(
            actions.pollLedgerDevice({ state, commit, dispatch })
          ).rejects.toThrow(
            `Could not find a connected and unlocked Ledger device`
          )
        })

        it(`when Ledger is on screensaver mode`, async () => {
          state.externals.App = () => ({
            publicKey: () =>
              Promise.resolve({
                error_message: `Unknown error code`
              })
          })
          await expect(
            actions.pollLedgerDevice({ state, commit, dispatch })
          ).rejects.toThrow(`Ledger's screensaver mode is on`)
        })

        it(`when Ledger is outdated`, async () => {
          state.externals.App = () => ({
            publicKey: () =>
              Promise.resolve({
                error_message: `Instruction not supported`
              })
          })
          await expect(
            actions.pollLedgerDevice({ state, commit, dispatch })
          ).rejects.toThrow(
            `Your Cosmos Ledger App is not up to date. ` +
              `Please update to version 1.5.0.`
          )
        })

        it(`fails when Ledger is on another app`, async () => {
          state.externals.App = () => ({
            publicKey: () =>
              Promise.resolve({
                error_message: `No errors`
              })
          })
          dispatch = action => {
            if (action === "getLedgerCosmosVersion") {
              return "1.5.0"
            }
            if (action === "getOpenAppInfo") {
              throw new Error("Close Ethereum and open the Cosmos app")
            }
          }

          await expect(
            actions.pollLedgerDevice({ state, commit, dispatch })
          ).rejects.toThrow(`Close Ethereum and open the Cosmos app`)

          dispatch = action => {
            if (action === "getLedgerCosmosVersion") {
              return "1.5.0"
            }
            if (action === "getOpenAppInfo") {
              return
            }
          }

          // does not throw
          await actions.pollLedgerDevice({ state, commit, dispatch })
        })

        it(`fails if publicKey throws`, async () => {
          state.externals.App = () => ({
            publicKey: () =>
              Promise.resolve({
                error_message: `Execution Error`
              })
          })
          await expect(
            actions.pollLedgerDevice({ state, commit, dispatch })
          ).rejects.toThrow(`Execution Error`)
        })

        it(`shows a deprecation warning`, async () => {
          state.externals.App = () => ({
            publicKey: () =>
              Promise.resolve({
                error_message: `No errors`
              })
          })
          dispatch = action => {
            if (action === "getLedgerCosmosVersion") {
              return "1.1.1"
            }
            if (action === "getOpenAppInfo") {
              return
            }
          }

          await actions.pollLedgerDevice({ state, commit, dispatch })
          expect(commit).toHaveBeenCalledWith("notifyWarn", {
            body:
              "Your Ledger Cosmos App version is going to be deprecated. Please update to the lastest app version using Ledger Live.",
            title: "Ledger Cosmos App Outdated"
          })
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
          dispatch = jest.fn(async () => Promise.resolve(`1.5.0`))
          await actions.connectLedgerApp({
            commit,
            dispatch,
            state
          })
          expect(dispatch).toHaveBeenCalledWith(`pollLedgerDevice`)
          expect(dispatch).toHaveBeenCalledWith(`createLedgerAppInstance`)
          expect(dispatch).toHaveBeenCalledWith(`getLedgerAddressAndPubKey`)
          expect(commit).not.toHaveBeenCalledWith(
            `setLedgerError`,
            expect.anything()
          )
        })

        it(`fails if one of the function throws`, async () => {
          dispatch = jest.fn(async () => Promise.reject(new Error(`error`)))
          await expect(
            actions.connectLedgerApp({ commit, dispatch, state })
          ).rejects.toThrowError(`error`)
        })
      })

      describe(`get_version`, () => {
        it(`gets and sets the version success`, async () => {
          state.externals.config = {
            requiredCosmosAppVersion: "0.0.1"
          }

          await actions.getLedgerCosmosVersion({
            commit,
            dispatch,
            state,
            rootState: mockRootState
          })
          expect(commit).toHaveBeenCalledWith(`setCosmosAppVersion`, "1.0.1")
        })

        it(`throws an error on failure`, async () => {
          state.cosmosApp.get_version = jest.fn(async () =>
            Promise.reject(new Error(`Execution Error`))
          )
          expect(
            actions.getLedgerCosmosVersion({
              commit,
              dispatch,
              state,
              rootState: mockRootState
            })
          ).rejects.toThrow(`Execution Error`)
          expect(commit).not.toHaveBeenCalled()
        })

        it(`throws an error if outdated`, async () => {
          state.externals.config = {
            requiredCosmosAppVersion: "2.0.1"
          }
          const version = {
            major: 1,
            minor: 0,
            patch: 0,
            test_mode: false,
            error_message: `No errors`
          }
          state.cosmosApp.get_version = jest.fn(async () => version)
          await expect(
            actions.getLedgerCosmosVersion({
              commit,
              dispatch,
              state,
              rootState: mockRootState
            })
          ).rejects.toThrow(
            `Outdated version: please update Cosmos app to 2.0.1`
          )
          expect(commit).not.toHaveBeenCalledWith(
            `setCosmosAppVersion`,
            version
          )
        })

        it("throws if using test version on mainnet", async () => {
          state.externals.config = {
            requiredCosmosAppVersion: "0.0.1"
          }
          const version = {
            major: 1,
            minor: 0,
            patch: 0,
            test_mode: true,
            error_message: `No errors`
          }
          state.cosmosApp.get_version = jest.fn(async () => version)
          await expect(
            actions.getLedgerCosmosVersion({
              commit,
              dispatch,
              state,
              rootState: mockRootState
            })
          ).rejects.toThrow(
            `DANGER: The Cosmos Ledger app is in test mode and shouldn't be used on mainnet!`
          )
          expect(commit).not.toHaveBeenCalledWith(
            `setCosmosAppVersion`,
            version
          )
        })
      })

      describe("getOpenAppInfo", () => {
        it("throws if not on Cosmos app", async () => {
          await expect(
            actions.getOpenAppInfo(
              { state },
              {
                appInfo: () => ({
                  error_message: `No errors`,
                  appName: "Ethereum"
                })
              }
            )
          ).rejects.toThrowError("Close Ethereum and open the Cosmos app")

          await expect(
            actions.getOpenAppInfo(
              { state },
              {
                appInfo: () => ({
                  error_message: `No errors`,
                  appName: "Cosmos"
                })
              }
            )
          ).resolves
        })
      })

      describe("confirmLedgerAddress", () => {
        it("throws if not confirmed address", async () => {
          await expect(
            actions.confirmLedgerAddress({
              state: {
                cosmosAppVersion: "1.5.0",
                cosmosApp: {
                  getAddressAndPubKey: () => ({
                    error_message: `Transaction rejected`
                  })
                }
              }
            })
          ).rejects.toThrowError("Displayed address was rejected")
        })

        it("automatically passed on old Ledgers as they don't have this feature", async () => {
          await expect(
            actions.confirmLedgerAddress({
              state: {
                cosmosAppVersion: "1.1.1",
                cosmosApp: {
                  getAddressAndPubKey: () => ({
                    error_message: `Transaction rejected`
                  })
                }
              }
            })
          ).resolves
        })
      })

      describe(`publicKey`, () => {
        it(`gets and sets the account public Key on success`, async () => {
          const pubKey = Buffer.from([1])
          await actions.getLedgerAddressAndPubKey({ commit, dispatch, state })
          expect(commit).toHaveBeenCalledWith(`setLedgerPubKey`, pubKey)
        })

        it(`sets an error on failure`, async () => {
          const pubKey = Buffer.from([1])
          state.cosmosApp.publicKey = () =>
            Promise.resolve({
              error_message: `Bad key handle`
            })
          await expect(
            actions.getLedgerAddressAndPubKey({ commit, dispatch, state })
          ).rejects.toThrowError(`Bad key handle`)
          expect(commit).not.toHaveBeenCalledWith(`setLedgerPubKey`, pubKey)
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
        })

        it(`fails if message is not JSON`, async () => {
          const msg = `{"account_number": 1,"chain_id": "some_chain","fee": {"amount": [{"amount": 10, "denom": "DEN"}],"gas": 5},"memo": "MEMO","msgs": ["SOMETHING"],"sequence": 3}`
          state.cosmosApp.sign = () =>
            Promise.resolve({
              error_message: `Bad key handle`
            })
          await expect(
            actions.signWithLedger({ commit, dispatch, state }, msg)
          ).rejects.toThrowError(`Bad key handle`)
        })

        it(`fails if transaction is rejected`, async () => {
          const msg = `{"account_number": 1,"chain_id": "some_chain","fee": {"amount": [{"amount": 10, "denom": "DEN"}],"gas": 5},"memo": "MEMO","msgs": ["SOMETHING"],"sequence": 3}`
          state.cosmosApp.sign = () =>
            Promise.resolve({
              error_message: `Command not allowed`
            })
          await expect(
            actions.signWithLedger({ commit, dispatch, state }, msg)
          ).rejects.toThrowError(`Transaction rejected`)
        })
      })
    })
  })
})
