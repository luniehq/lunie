import transactionsModule from "renderer/vuex/modules/transactions.js"
import txs from "./json/txs"

const mockRootState = {
  connection: {
    connected: true
  },
  session: {
    address: `default`,
    signedIn: true
  }
}

describe(`Module: Transactions`, () => {
  let module, state, actions, mutations, node

  beforeEach(async () => {
    node = {
      getDelegatorTxs: () => Promise.resolve([{
        txhash: 1
      }]),
      txs: () => Promise.resolve([{
        txhash: 2
      }]),
      getGovernanceTxs: () => Promise.resolve([{
        txhash: 3
      }, {
        txhash: 3
      }])
    }
    module = transactionsModule({
      node
    })
    state = module.state
    actions = module.actions
    mutations = module.mutations
  })

  it(`should have an empty state by default`, () => {
    expect(state).toMatchSnapshot()
  })

  it(`should update transaction times`, () => {
    state.wallet.push({
      height: `3436`
    })
    // enrich one wallet tx
    mutations.setTransactionTime(state, {
      blockHeight: `3436`,
      blockMetaInfo: {
        header: {
          time: 42000
        }
      }
    })
    expect(state.wallet.find(tx => tx.height === `3436`).time).toBe(42000)
  })

  it(`should clear session data`, () => {
    actions.resetSessionData({
      rootState: {
        transactions: {
          wallet: [{}],
          staking: [{}]
        }
      }
    })
    expect(state.wallet).toHaveLength(0)
    expect(state.staking).toHaveLength(0)
  })

  it(`should load and enrich txs`, async () => {
    const dispatch = jest
      .fn()
      .mockImplementationOnce(() => txs.slice(4))
      .mockImplementationOnce(() => txs.slice(2, 4))
      .mockImplementationOnce(() => txs.slice(0, 2))
    const commit = jest.fn()
    await actions.getAllTxs({
      commit,
      dispatch,
      state,
      rootState: mockRootState
    })
    expect(dispatch).toHaveBeenCalledWith(
      `enrichTransactions`,
      expect.arrayContaining([])
    )
    expect(commit).toHaveBeenCalledWith(`setStakingTxs`, txs.slice(4))
    expect(commit).toHaveBeenCalledWith(`setGovernanceTxs`, txs.slice(2, 4))
    expect(commit).toHaveBeenCalledWith(`setWalletTxs`, txs.slice(0, 2))
  })

  it(`should fail if trying to get transactions of wrong type`, () => {
    expect(
      actions.getTx({
        rootState: mockRootState
      }, `unknown`)
    ).rejects.toThrowError(new Error(`Unknown transaction type`))
  })

  describe(`queries the txs on reconnection`, () => {
    it(`when the user has logged in and is loading`, async () => {
      const dispatch = jest.fn()
      await actions.reconnected({
        state: {
          loading: true
        },
        dispatch,
        rootState: {
          session: {
            signedIn: true
          }
        }
      })
      expect(dispatch).toHaveBeenCalledWith(`getAllTxs`)
    })

    it(`fails if txs are not loading`, async () => {
      const dispatch = jest.fn()
      await actions.reconnected({
        state: {
          loading: false
        },
        dispatch,
        rootState: {
          session: {
            signedIn: true
          }
        }
      })
      expect(dispatch).not.toHaveBeenCalledWith(`getAllTxs`)
    })

    it(`fails if the user hasn't logged in`, async () => {
      const dispatch = jest.fn()
      await actions.reconnected({
        state: {
          loading: true
        },
        dispatch,
        rootState: {
          session: {
            signedIn: false
          }
        }
      })
      expect(dispatch).not.toHaveBeenCalledWith(`getAllTxs`)
    })
  })

  it(`should set error to true if enriching transactions fail`, async () => {
    const error = new Error(`unexpected error`)
    const { actions, state } = module

    const commit = jest.fn()
    const dispatch = jest.fn(() => {
      throw error
    })
    await actions.getAllTxs({
      commit,
      dispatch,
      state,
      rootState: mockRootState
    })

    expect(state.error).toBe(error)
  })

  describe(`mutations`, () => {
    it(`should set wallet transactions `, () => {
      const transactions = txs.slice(0, 2)
      mutations.setWalletTxs(state, transactions)
      expect(state.wallet).toBe(transactions)
    })

    it(`should set staking transactions `, () => {
      const transactions = txs.slice(2)
      mutations.setStakingTxs(state, transactions)
      expect(state.staking).toBe(transactions)
    })

    it(`should set governance transactions `, () => {
      const transactions = txs.slice(2, 4)
      mutations.setGovernanceTxs(state, transactions)
      expect(state.governance).toBe(transactions)
    })

    it(`should set history loading`, () => {
      mutations.setHistoryLoading(state, false)
      expect(state.loading).toEqual(false)
    })

    it(`should set denoms`, () => {
      const { state, mutations } = module
      state.staking = [{
        height: 150
      }]
      mutations.setTransactionTime(state, {
        blockHeight: 150,
        blockMetaInfo: {
          header: {
            time: 123
          }
        }
      })
      expect(state.staking).toEqual([{
        height: 150, time: 123
      }])
    })
  })

  it(`should getTx staking`, async () => {
    const address = `xxx`
    const staking = await actions.getTx(
      {
        rootState: {
          session: {
            address
          }
        }
      },
      `staking`
    )
    expect(staking).toEqual([{
      txhash: 1, type: `staking`
    }])
  })

  it(`should getTx governance`, async () => {
    const address = `xxx`
    const governance = await actions.getTx(
      {
        rootState: {
          session: {
            address
          }
        }
      },
      `governance`
    )
    expect(governance).toEqual([{
      txhash: 3, type: `governance`
    }])
  })

  it(`should getTx wallet`, async () => {
    const address = `xxx`
    const wallet = await actions.getTx(
      {
        rootState: {
          session: {
            address
          }
        }
      },
      `wallet`
    )
    expect(wallet).toEqual([{
      txhash: 2, type: `wallet`
    }])
  })

  it(`should getTx error`, async () => {
    const address = `xxx`
    try {
      await actions.getTx({
        rootState: {
          session: {
            address
          }
        }
      }, `chachacha`)
      expect(`I should have failed`).toEqual(`earlier`) // this is here to be sure we never reach this line
    } catch (e) {
      expect(e.message).toEqual(`Unknown transaction type`)
    }
  })

  it(`should enrichTransactions`, async () => {
    const dispatch = jest.fn()
    await actions.enrichTransactions(
      {
        dispatch
      },
      {
        transactions: [{
          height: 1
        }, {
          height: 2
        }]
      }
    )
    expect(dispatch).toHaveBeenCalledWith(`queryTransactionTime`, {
      blockHeight: 1
    })
    expect(dispatch).toHaveBeenCalledWith(`queryTransactionTime`, {
      blockHeight: 2
    })
  })
})
