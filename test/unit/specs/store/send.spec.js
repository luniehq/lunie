import setup from '../../helpers/vuex-setup'

let instance = setup()

describe('Module: Send', () => {
  let store, node

  beforeEach(() => {
    let test = instance.shallow(null)
    store = test.store
    node = test.node
  })

  // DEFAULT

  it('should have an empty state by default', () => {
    const state = {
      loading: false,
      nonce: 0,
      sending: false,
      queue: []
    }
    expect(store.state.send).toEqual(state)
  })

  // MUTATIONS

  it('should set wallet nonce', () => {
    const nonce = 959
    store.commit('setNonce', nonce)
    expect(store.state.send.nonce).toBe(nonce)
  })

  it('should add a tx to the queue', () => {
    const tx = { denom: 'acoin', amount: '500' }
    store.commit('queueSend', tx)
    expect(store.state.send.queue).toContain(tx)
  })

  it('should shift the queue', () => {
    const txOne = { id: 'first-tx', denom: 'acoin', amount: '50' }
    const txTwo = { id: 'second-tx', denom: 'acoin', amount: '125' }
    store.commit('queueSend', txOne)
    store.commit('queueSend', txTwo)
    store.commit('shiftSendQueue')
    expect(store.state.send.queue[0]).toBe(txTwo)
  })

  it('should continue with the next tx in queue', async () => {
    const txOne = { type: 'test', id: 'first-tx', denom: 'acoin', amount: 50 }
    const txTwo = { type: 'test', id: 'second-tx', denom: 'acoin', amount: 125 }
    node.test = (v) => Promise.resolve(v)
    node.sign = (v) => Promise.resolve(v)
    node.postTx = jest.fn(() => Promise.resolve({
      check_tx: {}, deliver_tx: {}
    }))

    await store.dispatch('sendTx', txOne)
    let txDone = await store.dispatch('sendTx', txTwo)
    await txDone
    expect(store.state.send.queue.length).toBe(0)

    expect(node.postTx.mock.calls.length).toBe(2)
  })

  it('should set sending', () => {
    store.commit('setSending', true)
    expect(store.state.send.sending).toBe(true)
  })

  // ACTIONS

  it('should query wallet nonce', async () => {
    const key = { address: 'DC97A6E1A3E1FE868B55BA93C7FC626368261E09' }
    const nonce = 42
    node.queryNonce = async (addr) => {
      expect(addr).toBe(key.address)
      return { data: nonce }
    }
    await store.dispatch('initializeWallet', key)
    await store.dispatch('queryNonce', key.address)
    expect(store.state.send.nonce).toBe(nonce)
  })

  describe('send transactions', () => {
    beforeEach(async () => {
      let account = 'abc'
      let password = '123'
      node.sendTx = jest.fn(() => Promise.resolve())
      await store.dispatch('signIn', {account, password})
    })

    it('should send from wallet', async () => {
      const args = { type: 'buildSend' }
      await store.dispatch('walletSend', args)
      expect(node.sendTx.mock.calls).toMatchSnapshot()
    })

    it('should send a tx ', async () => {
      node.queryNonce = async (addr) => ({ data: 88 })
      const key = { address: 'DC97A6E1A3E1FE868B55BA93C7FC626368261E09' }
      await store.dispatch('initializeWallet', key)
      const args = {
        to: 'foo',
        type: 'buildSend',
        amount: { denom: 'foocoin', amount: 9001 }
      }
      await store.dispatch('sendTx', args)
      expect(node.sendTx.mock.calls).toMatchSnapshot()
    })

    it('should fail sending a wallet tx ', async done => {
      node.sign = () => Promise.reject()
      const args = { type: 'buildSend' }
      store.dispatch('walletSend', args)
        .then(done.fail, () => done())
    })

    it('should query the nonce on reconnection', () => {
      store.state.node.stopConnecting = true
      store.state.send.loading = true
      jest.spyOn(node, 'queryNonce')
      store.dispatch('reconnected')
      expect(node.queryNonce).toHaveBeenCalled()
    })
  })
})
