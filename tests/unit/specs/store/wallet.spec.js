import walletModule from "modules/wallet.js"
import mockValues from "tests/unit/helpers/mockValues.js"

const { stakingParameters } = mockValues.state

const mockRootState = {
  stakingParameters,
  connection: {
    connected: true
  },
  session: { signedIn: true }
}
const faucet = `http://gimme.money`
const denoms = [`mycoin`, `fermion`, `STAKE`]
const config = { faucet, denoms }

describe(`Module: Wallet`, () => {
  let instance, state

  beforeEach(() => {
    instance = walletModule({
      node: {
        get: {}
      }
    })
    state = instance.state
    state.externals = {
      config,
      axios: {
        get: jest.fn(() => Promise.resolve(`ok`))
      }
    }
  })

  // DEFAULT

  it(`should have an empty state by default`, () => {
    const { state } = instance
    expect(state).toMatchSnapshot()
  })

  describe(`mutations`, () => {
    it(`should set wallet balances `, () => {
      const { state, mutations } = instance
      const balances = [{ denom: `leetcoin`, amount: `1337` }]
      mutations.setWalletBalances(state, balances)
      expect(state.balances).toBe(balances)
    })

    it(`update individual wallet balances`, () => {
      const { state, mutations } = instance

      state.balances.push({ denom: `coin`, amount: `42` })

      // add new
      const balance = { denom: `leetcoin`, amount: `1337` }
      mutations.updateWalletBalance(state, balance)
      expect(state.balances).toContain(balance)

      // update balance
      const updatedBalance = { denom: `leetcoin`, amount: `1` }
      mutations.updateWalletBalance(state, updatedBalance)
      expect(state.balances).toContain(updatedBalance)
    })

    it(`should set wallet key and clear balance `, () => {
      const { state, mutations } = instance
      const address = `tb1v9jxgun9wdenzv3nu98g8r`
      mutations.setWalletAddress(state, address)
      expect(state.address).toBe(address)
      expect(state.balances).toEqual([])
    })

    it(`should set the account number`, () => {
      const { state, mutations } = instance
      mutations.setAccountNumber(state, `0`)
      expect(state.accountNumber).toBe(`0`)
    })
  })

  describe(`actions`, () => {
    it(`should reset session data`, () => {
      const { actions } = instance
      const rootState = {}
      actions.resetSessionData({ rootState })
      expect(rootState).toHaveProperty(`wallet`)
    })

    it(`should initialize wallet`, async () => {
      const { actions } = instance

      const address = `cosmos1wdhk6e2pv3j8yetnwv0yr6s6`
      const commit = jest.fn()
      const dispatch = jest.fn(() => Promise.resolve())
      state.balances = [
        {
          denom: `stake`,
          amount: `100`
        }
      ]
      await actions.initializeWallet({ state, commit, dispatch }, { address })
      expect(commit).toHaveBeenCalledWith(`setWalletAddress`, address)
      expect(dispatch.mock.calls).toEqual([
        [`queryWalletBalances`],
        [`walletSubscribe`],
        [`getBondedDelegates`],
        [`getRewardsFromMyValidators`]
      ])
    })

    it(`should query wallet balances`, async () => {
      const coins = [
        {
          denom: `fermion`,
          amount: 42
        }
      ]
      const node = {
        get: {
          account: jest.fn(() =>
            Promise.resolve({
              coins,
              sequence: `1`,
              account_number: `2`
            })
          )
        }
      }
      instance = walletModule({
        node
      })
      const { state, actions } = instance
      const commit = jest.fn()
      state.address = `abc`
      await actions.queryWalletBalances({
        state,
        rootState: mockRootState,
        commit
      })
      expect(commit.mock.calls).toEqual([
        [`setAccountNumber`, `2`],
        [`setWalletBalances`, coins]
      ])
      expect(node.get.account).toHaveBeenCalled()
    })

    describe(`queries the balances on reconnection`, () => {
      it(`when the user has logged in`, async () => {
        const { actions } = instance
        const dispatch = jest.fn()
        await actions.reconnected({
          state: {
            loading: true,
            address: `abc`
          },
          dispatch,
          rootState: { session: { signedIn: true } }
        })
        expect(dispatch).toHaveBeenCalledWith(`queryWalletBalances`)
      })

      it(`fails if user hasn't signed in`, async () => {
        const { actions } = instance
        const dispatch = jest.fn()
        await actions.reconnected({
          state: {
            loading: true,
            address: `abc`
          },
          dispatch,
          rootState: { session: { signedIn: false } }
        })
        expect(dispatch).not.toHaveBeenCalledWith(`queryWalletBalances`)
      })
    })

    it(`should not query the balances on reconnection if not stuck in loading`, async () => {
      const { actions } = instance
      const dispatch = jest.fn()
      await actions.reconnected({
        state: {
          loading: false,
          address: `abc`
        },
        dispatch
      })
      expect(dispatch).not.toHaveBeenCalledWith(`queryWalletBalances`)
    })

    it(`should query wallet data at specified height`, async done => {
      const { actions } = instance

      jest.useFakeTimers()
      const rootState = {
        connection: {
          lastHeader: {
            height: 10
          }
        }
      }
      const dispatch = jest.fn()
      actions
        .queryWalletStateAfterHeight({ rootState, dispatch }, 11)
        .then(() => done())
      rootState.connection.lastHeader.height++
      jest.runAllTimers()
      jest.useRealTimers()
    })

    it(`should not error when subscribing with no address`, async () => {
      const { actions } = instance
      const dispatch = jest.fn()
      await actions.walletSubscribe({
        rootState: { session: { address: undefined } },
        dispatch
      })
    })

    it(`should query wallet on subscription txs`, async () => {
      jest.useFakeTimers()

      const node = {
        rpc: {
          subscribe: jest.fn((_, cb) => {
            //query is param
            cb({ TxResult: { height: -1 } })

            return Promise.resolve()
          })
        }
      }
      const { actions } = walletModule({
        node
      })
      const dispatch = jest.fn()

      await actions.walletSubscribe({
        rootState: { session: { address: `x` } },
        dispatch
      })

      jest.runTimersToTime(30000)
      expect(dispatch).toHaveBeenCalledTimes(6)
    })

    it(`should catch errors from subscriptions`, async () => {
      jest.useFakeTimers()
      jest.spyOn(console, "error").mockImplementation(() => {})

      const node = {
        rpc: {
          subscribe: jest.fn(() => {
            return Promise.reject("Expected")
          })
        }
      }
      const { actions } = walletModule({
        node
      })
      const dispatch = jest.fn()

      await actions.walletSubscribe({
        rootState: { session: { address: `x` } },
        dispatch
      })

      jest.runTimersToTime(30000)
      expect(dispatch).toHaveBeenCalledTimes(0)

      console.error.mockRestore()
    })

    it(`should store an error if failed to load balances`, async () => {
      const node = {
        get: {
          account: jest.fn(() => Promise.reject(new Error(`Error`)))
        }
      }
      const { state, actions } = walletModule({
        node
      })
      const commit = jest.fn()
      state.address = `x`
      jest
        .spyOn(node.get, `account`)
        .mockImplementationOnce(() => Promise.reject(new Error(`Error`)))
      await actions.queryWalletBalances({
        state,
        rootState: mockRootState,
        commit
      })
      expect(state.error.message).toBe(`Error`)
    })
  })
})
