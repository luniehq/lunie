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
      const pubKey = Buffer.from([
        4,
        228,
        114,
        95,
        12,
        248,
        233,
        150,
        121,
        120,
        108,
        215,
        35,
        230,
        147,
        188,
        25,
        67,
        15,
        209,
        28,
        190,
        133,
        163,
        176,
        205,
        91,
        131,
        112,
        190,
        111,
        120,
        229,
        35,
        85,
        207,
        82,
        109,
        65,
        22,
        237,
        67,
        55,
        19,
        171,
        79,
        225,
        208,
        53,
        24,
        254,
        23,
        97,
        58,
        0,
        18,
        18,
        212,
        152,
        188,
        87,
        18,
        47,
        249,
        17
      ])
      mutations.setLedgerPubKey(state, pubKey)
      expect(state.pubKey).toBe(pubKey)
    })

    it(`sets the account public key`, () => {
      const pubKeyFull = Buffer.from([
        4,
        228,
        114,
        95,
        12,
        248,
        233,
        150,
        121,
        120,
        108,
        215,
        35,
        230,
        147,
        188,
        25,
        67,
        15,
        209,
        28,
        190,
        133,
        163,
        176,
        205,
        91,
        131,
        112,
        190,
        111,
        120,
        229,
        35,
        85,
        207,
        82,
        109,
        65,
        22,
        237,
        67,
        55,
        19,
        171,
        79,
        225,
        208,
        53,
        24,
        254,
        23,
        97,
        58,
        0,
        18,
        18,
        212,
        152,
        188,
        87,
        18,
        47,
        249,
        17
      ])
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
        actions.checkLedgerErrors({ commit }, { response, title })
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

    // describe(`Ledger actions`, () => {
    //   beforeEach(async () => {
    //     const comm = await comm_u2f.create_async(10, true)
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
    //       expect(commit.mock.calls).toContain([`setLedgerUncompressedPubKey`])
    //       expect(commit.mock.calls).not.toContain([`notifyError`])
    //     })
    //   })

    //   // describe(`sign`, () => {
    //   //   it(`signs message succesfully`, () => {})

    //   //   it(`fails if message is not JSON`, () => {})
    //   // })
    // })
  })
})
