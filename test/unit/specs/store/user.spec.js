import setup from "../../helpers/vuex-setup"
import userModule from "renderer/vuex/modules/user.js"
import b32 from "scripts/b32"

function mockGA() {
  window.analytics = { send: jest.fn() }
}
jest.mock(`renderer/google-analytics.js`, () => mockGA)

const instance = setup()

describe(`Module: User`, () => {
  let store, node
  const accounts = [
    {
      address: `tb1zg69v7yszg69v7yszg69v7yszg69v7ysd8ep6q`,
      name: `ACTIVE_ACCOUNT`
    }
  ]

  beforeEach(() => {
    const test = instance.shallow()
    store = test.store
    node = test.node
  })

  it(`should default to signed out state`, () => {
    expect(store.state.user.signedIn).toBe(false)
    expect(store.state.user.account).toBe(null)
    expect(store.state.user.address).toBe(null)
  })

  it(`should add and remove history correctly`, () => {
    expect(store.state.user.history.length).toBe(0)
    store.commit(`addHistory`, `/`)
    expect(store.state.user.history.length).toBe(1)
    store.commit(`popHistory`)
    expect(store.state.user.history.length).toBe(0)
  })
  it(`should pauseHistory correctly`, () => {
    expect(store.state.user.pauseHistory).toBe(false)
    store.commit(`pauseHistory`, true)
    expect(store.state.user.pauseHistory).toBe(true)
    store.commit(`pauseHistory`, false)
    expect(store.state.user.pauseHistory).toBe(false)
  })

  it(`should set accounts`, () => {
    store.commit(`setAccounts`, accounts)
    expect(store.state.user.accounts).toEqual(accounts)
  })

  it(`should show an error if loading accounts fails`, async () => {
    const { actions, state } = userModule({
      node: {
        keys: {
          values: () => Promise.reject(new Error(`Expected Error`))
        }
      }
    })
    jest.spyOn(console, `error`).mockImplementationOnce(() => {})
    const commit = jest.fn()
    await actions.loadAccounts({ state, commit })
    expect(commit).toHaveBeenCalledWith(`notifyError`, {
      title: `Couldn't read keys`,
      body: expect.stringContaining(`Expected Error`)
    })
  })

  it(`should set atoms`, () => {
    store.commit(`setAtoms`, 42)
    expect(store.state.user.atoms).toBe(42)
  })

  it(`should prepare the signin`, async () => {
    node.keys.values = () => Promise.resolve(accounts)
    await store.dispatch(`showInitialScreen`)
    expect(store.state.config.modals.session.state).toBe(`sign-in`)
    expect(store.state.config.modals.session.active).toBe(true)
  })

  it(`should show a welcome screen if there are no accounts yet`, async () => {
    const previousValues = node.keys.values
    node.keys.values = () => Promise.resolve([])
    await store.dispatch(`showInitialScreen`)
    expect(store.state.config.modals.session.state).toBe(`welcome`)
    expect(store.state.config.modals.session.active).toBe(true)
    node.keys.values = previousValues
  })

  it(`should test if the login works`, async () => {
    node.keys.set = (account, { name, old_password, new_password }) => {
      expect(account).toBe(name)
      expect(old_password).toBe(new_password)
      return true
    }
    const output = await store.dispatch(`testLogin`, {
      account: `default`,
      password: `1234567890`
    })
    expect(output).toBe(true)
  })

  it(`should raise an error if login test fails`, done => {
    node.keys.set = () => Promise.reject(`Expected error`)
    store.dispatch(`testLogin`, {}).catch(() => done())
  })

  it(`should create a seed phrase`, async () => {
    const seed = await store.dispatch(`createSeed`)
    expect(seed).toBeDefined()
    expect(seed.split(` `).length).toBe(24)
  })

  it(`should create a key from a seed phrase`, async () => {
    const seedPhrase = `abc`
    const password = `123`
    const name = `def`
    node.keys.add = jest.fn(node.keys.add)
    const address = await store.dispatch(`createKey`, {
      seedPhrase,
      password,
      name
    })
    expect(node.keys.add).toHaveBeenCalledWith({
      seed: seedPhrase,
      password,
      name
    })
    b32.decode(address)
    // initialize wallet
    expect(store.state.wallet.address).toBe(address)
  })

  it(`should delete a key`, async () => {
    const password = `123`
    const name = `def`
    node.keys.delete = jest.fn()
    await store.dispatch(`deleteKey`, { password, name })
    expect(node.keys.delete).toHaveBeenCalledWith(name, { password, name })
  })

  it(`should sign in`, async () => {
    const password = `123`
    const account = `def`
    node.keys.get = jest.fn(() =>
      Promise.resolve({ address: `tb1wdhk6efqv9jxgun9wdesd6m8k8` })
    )
    await store.dispatch(`signIn`, { password, account })
    expect(node.keys.get).toHaveBeenCalledWith(account)
    expect(store.state.user.signedIn).toBe(true)

    // initialize wallet
    expect(store.state.wallet.address).toEqual(`tb1wdhk6efqv9jxgun9wdesd6m8k8`)

    // hide login
    expect(store.state.config.modals.session.active).toBe(false)
  })

  it(`should sign out`, async () => {
    const password = `123`
    const account = `def`
    await store.dispatch(`signIn`, { password, account })
    store.dispatch(`signOut`)
    expect(store.state.user.account).toBe(null)
    expect(store.state.user.signedIn).toBe(false)

    // hide login
    expect(store.state.config.modals.session.active).toBe(true)
  })

  it(`should set the error collection opt in`, async () => {
    const Sentry = require(`@sentry/browser`)
    await store.dispatch(`setErrorCollection`, { account: `abc`, optin: true })
    expect(store.state.user.errorCollection).toBe(true)
    expect(window.analytics).toBeTruthy()
    expect(Sentry.init).toHaveBeenCalled()
    expect(Sentry.init).toHaveBeenCalledWith({
      dsn: expect.stringMatching(`https://.*@sentry.io/.*`),
      release: `voyager@0.0.1`
    })

    Sentry.init.mockClear()
    store.dispatch(`setErrorCollection`, { account: `abc`, optin: false })
    expect(store.state.user.errorCollection).toBe(false)
    expect(window.analytics).toBeFalsy()
    expect(Sentry.init).toHaveBeenCalledWith({})
  })

  it(`should persist the error collection opt in`, () => {
    const localStorageSpy = jest.spyOn(localStorage, `setItem`)
    store.dispatch(`setErrorCollection`, { account: `abc`, optin: true })

    expect(localStorageSpy).toHaveBeenCalledWith(
      `voyager_error_collection_abc`,
      true
    )
  })

  it(`should load the persistet error collection opt in`, () => {
    const localStorageSpy = jest.spyOn(localStorage, `getItem`)
    store.dispatch(`setErrorCollection`, { account: `abc`, optin: true })
    store.state.user.errorCollection = false
    store.dispatch(`loadErrorCollection`, `abc`)
    expect(store.state.user.errorCollection).toBe(true)
    expect(localStorageSpy).toHaveBeenCalledWith(`voyager_error_collection_abc`)

    store.dispatch(`setErrorCollection`, { account: `abc`, optin: false })
    store.state.user.errorCollection = true
    store.dispatch(`loadErrorCollection`, `abc`)
    expect(store.state.user.errorCollection).toBe(false)
  })
  it(`should reload accounts on reconnect as this could be triggered by a switch from a mocked connection`, async () => {
    store.state.user.accounts = []
    await store.dispatch(`reconnected`)
    expect(store.state.user.accounts.length).toBeGreaterThan(0)
  })

  it(`should not set error collection if in development mode`, async () => {
    const Sentry = require(`@sentry/browser`)
    jest.doMock(`electron`, () => ({
      ipcRenderer: { send: jest.fn() },
      remote: {
        getGlobal(name) {
          if (name === `config`)
            return {
              development: true
            }
        }
      }
    }))

    // we need to reset the module to use the mocked electron dependency
    jest.resetModules()
    const userModule = require(`renderer/vuex/modules/user.js`).default
    const { actions, state } = userModule({
      node: {
        keys: {
          values: () => Promise.reject(new Error(`Expected Error`))
        }
      }
    })

    const commit = jest.fn()
    Sentry.init.mockClear()
    actions.setErrorCollection(
      { state, commit },
      { account: `abc`, optin: true }
    )
    expect(state.errorCollection).toBe(false)
    expect(window.analytics).toBeFalsy()
    expect(Sentry.init).not.toHaveBeenCalled()
  })
})
