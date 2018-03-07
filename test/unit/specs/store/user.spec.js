import setup from '../../helpers/vuex-setup'

let instance = setup()

describe('Module: User', () => {
  let store, node
  let accounts = [{
    address: '1234567890123456789012345678901234567890',
    name: 'ACTIVE_ACCOUNT',
    password: '1234567890'
  }]

  beforeEach(() => {
    let test = instance.shallow()
    store = test.store
    node = test.node
  })

  it('should default to signed out state', () => {
    expect(store.state.user.signedIn).toBe(false)
    expect(store.state.user.password).toBe(null)
    expect(store.state.user.account).toBe(null)
    expect(store.state.user.address).toBe(null)
  })

  it('should set accounts', () => {
    store.commit('setAccounts', accounts)
    expect(store.state.user.accounts).toEqual(accounts)
  })

  it('should show an error if loading accounts fails', async () => {
    node.listKeys = () => Promise.reject('Expected Error')
    await store.dispatch('loadAccounts')
    expect(store.state.notifications[0].title).toBe(`Couldn't read keys`)
  })

  it('should set atoms', () => {
    store.commit('setAtoms', 42)
    expect(store.state.user.atoms).toBe(42)
  })

  it('should prepare the signin', async () => {
    node.listKeys = () => Promise.resolve(accounts)
    await store.dispatch('showInitialScreen')
    expect(store.state.config.modals.session.state).toBe('sign-in')
    expect(store.state.config.modals.session.active).toBe(true)
  })

  it('should show a welcome screen if there are no accounts yet', async () => {
    node.listKeys = () => Promise.resolve([])
    await store.dispatch('showInitialScreen')
    expect(store.state.config.modals.session.state).toBe('welcome')
    expect(store.state.config.modals.session.active).toBe(true)
  })

  it('should test if the login works', async () => {
    node.updateKey = (account, { name, password, new_passphrase }) => {
      expect(account).toBe(name)
      expect(password).toBe(new_passphrase)
      return true
    }
    let output = await store.dispatch('testLogin', {
      account: 'ABC',
      details: {
        name: 'ABC',
        password: '123',
        new_passphrase: '123'
      }
    })
    expect(output).toBe(true)
  })

  it('should raise an error if login test fails', done => {
    node.updateKey = () => Promise.reject('Expected error')
    store.dispatch('testLogin', {}).catch(() => done())
  })

  it('should create a seed phrase', async () => {
    let seed = await store.dispatch('createSeed')
    expect(seed).toBeDefined()
    expect(seed.split(' ').length).toBe(12)
  })

  it('should delete an existing trunc when generating a seed phrase', done => {
    node.listKeys = () => Promise.resolve([{ name: 'trunk' }])
    node.deleteKey = (account) => {
      expect(account).toBe('trunk')
      done()
    }
    store.dispatch('createSeed')
  })

  it('should create a key from a seed phrase', async () => {
    let seedPhrase = 'abc'
    let password = '123'
    let name = 'def'
    node.recoverKey = jest.fn(() => ({ key: {
      address: 'some address'
    } }))
    let key = await store.dispatch('createKey', { seedPhrase, password, name })
    expect(node.recoverKey).toHaveBeenCalledWith({
      seed_phrase: seedPhrase,
      password,
      name
    })
    expect(key).toEqual({
      address: 'some address'
    })

    // initialize wallet
    expect(store.state.wallet.key).toEqual({
      address: 'some address'
    })
  })

  it('should delete a key', async () => {
    let password = '123'
    let name = 'def'
    node.deleteKey = jest.fn()
    await store.dispatch('deleteKey', { password, name })
    expect(node.deleteKey).toHaveBeenCalledWith(name, { password, name })
  })

  it('should sign in', async () => {
    let password = '123'
    let account = 'def'
    node.getKey = jest.fn(() => Promise.resolve({
      address: 'some address'
    }))
    await store.dispatch('signIn', { password, account })
    expect(node.getKey).toHaveBeenCalledWith(account)
    expect(store.state.user.signedIn).toBe(true)

    // initialize wallet
    expect(store.state.wallet.key).toEqual({
      address: 'some address'
    })

    // hide login
    expect(store.state.config.modals.session.active).toBe(false)
  })

  it('should sign out', () => {
    store.dispatch('signOut')
    expect(store.state.user.account).toBe(null)
    expect(store.state.user.password).toBe(null)
    expect(store.state.user.signedIn).toBe(false)

    // hide login
    expect(store.state.config.modals.session.active).toBe(true)
  })
})
