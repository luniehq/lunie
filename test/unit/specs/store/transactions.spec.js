import setup from "../../helpers/vuex-setup"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
import walletTxs from "./json/txs.js"

let instance = setup()

describe(`Module: Transactions`, () => {
  let store, node

  beforeEach(async () => {
    let test = instance.shallow(null)
    store = test.store
    node = test.node

    await store.dispatch(`signIn`, {
      account: `default`,
      password: `1234567890`
    })

    // the mock txs are used at other places as well. there we simulate them already being enriched with time. here we want the pure txs to simulate enriching.
    store.commit(
      `setWalletTxs`,
      walletTxs.map(tx => {
        delete tx.time
        return tx
      })
    )
    store.commit(`setStakingTxs`, lcdClientMock.state.txs.slice(4))
    store.commit(`setStakingTxs`, lcdClientMock.state.txs.slice(2, 4))
  })

  // DEFAULT

  it(`should have an empty state by default`, () => {
    expect(store.state.transactions).toMatchSnapshot()
  })

  it(`should update transaction times`, () => {
    expect(
      store.state.transactions.wallet.find(tx => tx.height === `3436`).time
    ).toBeUndefined()
    // enrich one wallet tx
    store.commit(`setTransactionTime`, {
      blockHeight: `3436`,
      blockMetaInfo: {
        header: {
          time: 1042
        }
      }
    })
    expect(
      store.state.transactions.wallet.find(tx => tx.height === `3436`).time
    ).toBe(1042)
  })

  it(`should clear session data`, () => {
    store.dispatch(`resetSessionData`)
    expect(store.state.transactions.wallet).toHaveLength(0)
    expect(store.state.transactions.staking).toHaveLength(0)
  })

  it(`should load and enrich txs`, async () => {
    node.getDelegatorTxs = jest.fn(() => lcdClientMock.state.txs.slice(4))
    node.getGovernanceTxs = jest.fn(() => lcdClientMock.state.txs.slice(2, 4))
    node.txs = jest.fn(() => lcdClientMock.state.txs.slice(0, 2))

    // loading will enrich txs with block meta information. we set the info here so we can check if it was used in the snapshot
    store.state.blockchain.blockMetas = {
      "160": {
        header: { time: 10160 }
      },
      "170": {
        header: { time: 10170 }
      },
      "3438": {
        header: { time: 103438 }
      },
      "3436": {
        header: { time: 103436 }
      },
      "466": {
        header: { time: 10466 }
      }
    }

    store.dispatch(`resetSessionData`)
    await store.dispatch(`getAllTxs`)
    expect(store.state.transactions.wallet).toMatchSnapshot()
    expect(store.state.transactions.staking).toMatchSnapshot()
    expect(store.state.transactions.governance).toMatchSnapshot()
  })

  it(`should fail if trying to get transactions of wrong type`, async done => {
    await store.dispatch(`getTx`, `unknown`).catch(() => done())
  })

  it(`should query the txs on reconnection`, async () => {
    store.state.node.stopConnecting = true
    node.getGovernanceTxs = jest.fn(() => lcdClientMock.state.txs.slice(2, 4))
    store.state.transactions.loading = true
    jest.spyOn(node, `txs`)
    await store.dispatch(`reconnected`)
    expect(node.txs).toHaveBeenCalled()
  })

  it(`should not query the txs on reconnection if not stuck in loading`, async () => {
    store.state.node.stopConnecting = true
    store.state.transactions.loading = false
    jest.spyOn(node, `txs`)
    await store.dispatch(`reconnected`)
    expect(node.txs).not.toHaveBeenCalled()
  })
})
