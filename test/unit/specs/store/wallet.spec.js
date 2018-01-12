import setup from '../../helpers/vuex-setup'

let instance = setup()

describe('Module: Wallet', () => {
  let store, node

  beforeEach(() => {
    let test = instance.shallow(null)
    store = test.store
    node = test.node
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

  it('should continue with the next tx in queue', async () => {
    const txOne = { id: 'first-tx', denom: 'acoin', amount: '50' }
    const txTwo = { id: 'second-tx', denom: 'acoin', amount: '125' }
    store.commit('queueSend', txOne)
    node.sendTx = () => Promise.resolve()

    await store.dispatch('walletTx', txTwo)
    expect(store.state.wallet.sendQueue.length).toBe(0)
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
    node.queryAccount = () => Promise.resolve({
      data: {
        coins: [{
          denom: 'fermion',
          amount: 42
        }]
      }
    })
    await store.dispatch('queryWalletBalances')
    expect(store.state.wallet.balances).toEqual([{
      'amount': 42,
      'denom': 'fermion'
    }])
  })

  it('should query wallet sequence', async () => {
    const key = { address: 'DC97A6E1A3E1FE868B55BA93C7FC626368261E09' }
    const sequence = 42
    await store.dispatch('initializeWallet', key)
    node.queryNonce = async (addr) => {
      expect(addr).toBe(key.address)
      return { data: sequence }
    }
    await store.dispatch('queryWalletSequence')
    expect(store.state.wallet.sequence).toBe(sequence)
  })

  describe('query meta info', () => {
    let height = 100
    let blockMeta = {
      header: {
        height: 100,
        time: 42
      }
    }

    beforeEach(() => {
      // prefill history
      store.commit('setWalletHistory', [{
        height
      }])
      // prefill block metas
      store.state.wallet.blockMetas = [blockMeta]
    })

    it('should query transaction time', async () => {
      await store.dispatch('queryTransactionTime', height)
      expect(store.state.wallet.history[0].time).toBe(42)
    })

    it('should query block info', async () => {
      store.state.wallet.blockMetas = []
      node.rpc.blockchain = jest.fn(({ minHeight, maxHeight }, cb) => {
        cb(null, {block_metas: [blockMeta]})
      })

      let output = await store.dispatch('queryBlockInfo', height)
      expect(output).toBe(blockMeta)
    })

    it('should reuse queried block info', async () => {
      store.state.wallet.blockMetas = [blockMeta]
      node.rpc.blockchain = jest.fn()

      let output = await store.dispatch('queryBlockInfo', height)
      expect(output).toBe(blockMeta)
      expect(node.rpc.blockchain).not.toHaveBeenCalled()
    })

    it('should show an info if block info is unavailable', async () => {
      store.state.wallet.blockMetas = []
      node.rpc.blockchain = (props, cb) => cb('Error')
      // prefill history
      let height = 100
      let output = await store.dispatch('queryBlockInfo', height)
      expect(output).toBe(null)
      expect(store.state.notifications.length).toBe(1)
      expect(store.state.notifications[0]).toMatchSnapshot()
    })
  })

  describe('send transactions', () => {
    beforeEach(async () => {
      let account = 'abc'
      let password = '123'
      node.sendTx = jest.fn(() => Promise.resolve())
      await store.dispatch('signIn', {account, password})
    })

    it('should send from wallet', async () => {
      const args = { 'sequence': 42 }
      await store.dispatch('walletSend', args)
      expect(node.sendTx.mock.calls).toMatchSnapshot()
    })

    it('should send a wallet tx ', async () => {
      const args = { cb: function () { return 'hello-world' }, sequence: 42 }
      await store.dispatch('walletTx', args)
      expect(node.sendTx.mock.calls).toMatchSnapshot()
    })

    it('should fail sending a wallet tx ', async done => {
      node.sendTx = () => Promise.reject()
      const args = { cb: function () { return 'hello-world' }, sequence: 42 }
      store.dispatch('walletTx', args).then(() => done.fail(), () => done())
    })
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
