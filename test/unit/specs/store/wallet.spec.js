import Vuex from 'vuex'
import { createLocalVue } from 'vue-test-utils'

const Wallet = require('renderer/vuex/modules/wallet').default
const notifications = require('renderer/vuex/modules/notifications').default({})

const localVue = createLocalVue()
localVue.use(Vuex)

describe('Module: Wallet', () => {
  let store, node

  beforeEach(() => {
    node = require('../../helpers/node_mock')
    store = new Vuex.Store({
      modules: {
        wallet: Wallet({node}),
        notifications
      }
    })
  })

  // DEFAULT

  it('should have an empty state by default', () => {
    const state = {
      balances: [],
      sequence: 0,
      key: { address: '' },
      history: [],
      denoms: [],
      sendQueue: [],
      sending: false,
      blockMetas: []
    }
    expect(store.state.wallet).toEqual(state)
  })

  // MUTATIONS

  it('should set wallet balances ', () => {
    const balances = [ { denom: 'leetcoin', amount: '1337' } ]
    store.commit('setWalletBalances', balances)
    expect(store.state.wallet.balances).toBe(balances)
  })

  it('should set wallet key and clear balance ', () => {
    const key = 'antique-gold-key'
    store.commit('setWalletKey', key)
    expect(store.state.wallet.key).toBe(key)
    expect(store.state.wallet.balances).toEqual([])
  })

  it('should set wallet sequence', () => {
    const sequence = 959
    store.commit('setWalletSequence', sequence)
    expect(store.state.wallet.sequence).toBe(sequence)
  })

  it('should set wallet history', () => {
    const history = ['once', 'upon', 'a', 'time']
    store.commit('setWalletHistory', history)
    expect(store.state.wallet.history).toBe(history)
  })

  it('should set denoms', () => {
    const denoms = ['acoin', 'bcoin', 'ccoin']
    store.commit('setDenoms', denoms)
    expect(store.state.wallet.denoms).toBe(denoms)
  })

  it('should add a tx to the sendQueue', () => {
    const tx = { denom: 'acoin', amount: '500' }
    store.commit('queueSend', tx)
    expect(store.state.wallet.sendQueue).toContain(tx)
  })

  it('should shift the sendQueue', () => {
    const txOne = { id: 'first-tx', denom: 'acoin', amount: '50' }
    const txTwo = { id: 'second-tx', denom: 'acoin', amount: '125' }
    store.commit('queueSend', txOne)
    store.commit('queueSend', txTwo)
    store.commit('shiftSendQueue')
    expect(store.state.wallet.sendQueue).toBe(txOne)
  })

  it('should set sending', () => {
    store.commit('setSending', true)
    expect(store.state.wallet.sending).toBe(true)
  })

  it('should set transaction time', () => {
    const blockHeight = 31337
    const time = 1234567890
    const history = [
      { height: blockHeight }
    ]
    const blockMetaInfo = {
      header: {
        time: time
      }
    }
    store.commit('setWalletHistory', history)
    store.commit('setTransactionTime', { blockHeight, blockMetaInfo })
    expect(store.state.wallet.history[0].time).toBe(time)
  })

  // ACTIONS

  it('should initialize wallet', async () => {
    const key = { address: 'DC97A6E1A3E1FE868B55BA93C7FC626368261E09' }
    await store.dispatch('initializeWallet', key)
    expect(store.state.wallet.key).toEqual(key)
  })

  it('should query wallet state', async () => {
    store.dispatch('queryWalletState')
    expect(store.state.wallet.balances).toEqual([])
    expect(store.state.wallet.sequence).toBe(0)
    expect(store.state.wallet.history).toEqual([])
  })

  it('should query wallet balances', async () => {
    await store.dispatch('queryWalletBalances')
    expect(store.state.wallet.balances).toEqual([])
  })

  // TODO
  it('should query wallet sequence', async () => {
    await store.dispatch('queryWalletSequence')
  })

  // TODO
  it('should query wallet history', async () => {
    await store.dispatch('queryWalletHistory')
  })

  // TODO
  it('should query transaction time', async () => {
    let height = 100
    await store.dispatch('queryTransactionTime', height)
  })

  // TODO
  it('should query block info', async () => {
    let height = 100
    await store.dispatch('queryBlockInfo', height)
  })

  // TODO
  it('should send from wallet', async () => {
    const args = { cb: function () { return 'hello-world' } }
    await store.dispatch('walletSend', args)
  })

  // TODO
  it('should create a wallet tx ', async () => {
    const args = { cb: function () { return 'hello-world' } }
    await store.dispatch('walletTx', args)
  })

  it('should load denoms', async () => {
    await store.dispatch('loadDenoms')
    expect(store.state.wallet.denoms).toEqual(['mycoin', 'fermion', 'gregcoin'])
  })

  it('should enrich transaction times', async () => {
    node.coinTxs = () => Promise.resolve([{
      tx: {},
      height: 1
    }, {
      tx: {},
      height: 2
    }, {
      tx: {},
      height: 2
    }])
    node.rpc.blockchain = ({minHeight, maxHeight}, cb) => {
      cb(null, {
        block_metas: [{
          header: {
            height: minHeight,
            time: minHeight
          }
        }]
      })
    }
    jest.spyOn(node.rpc, 'blockchain')
    await store.dispatch('queryWalletHistory')
    expect(node.rpc.blockchain.mock.calls.length).toBe(2)
    expect(store.state.wallet.history[0].time).toBe(1)
    expect(store.state.wallet.history[1].time).toBe(2)
  })
})
