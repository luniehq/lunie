import Store from "renderer/vuex/store"
import node from "../../helpers/node_mock"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`Store`, () => {
  let store

  beforeEach(async () => {
    node.queryAccount = () => new Promise(() => {}) // make balances not return
    node.txs = () => new Promise(() => {}) // make txs not return
    store = Store({ node })
    localStorage.setItem(
      `store_test-net_` + lcdClientMock.addresses[0],
      undefined
    )

    jest.useFakeTimers()
    await store.dispatch(`setLastHeader`, {
      height: 42,
      chain_id: `test-net`
    })
    await store.dispatch(`signIn`, {
      account: `default`,
      password: `1234567890`
    })
  })

  // DEFAULT

  it(`should persist balances et al if the user is logged in`, async () => {
    store.commit(`setWalletBalances`, [{ denom: `fabocoin`, amount: 42 }])
    jest.runAllTimers() // updating is waiting if more updates coming in, this skips the waiting
    expect(
      localStorage.getItem(`store_test-net_` + lcdClientMock.addresses[0])
    ).toBeTruthy()
  })

  it(`should not update cache if not logged in`, async () => {
    await store.dispatch(`signOut`)
    store.commit(`setWalletBalances`, [{ denom: `fabocoin`, amount: 42 }])
    jest.runAllTimers() // updating is waiting if more updates coming in, this skips the waiting
    expect(
      localStorage.getItem(`store_test-net_` + lcdClientMock.addresses[0])
    ).toBeFalsy()
  })

  it(`should restore balances et al after logging in`, async () => {
    store.commit(`setWalletBalances`, [{ denom: `fabocoin`, amount: 42 }])
    store.commit(`setWalletTxs`, [{}])
    jest.runAllTimers() // updating is waiting if more updates coming in, this skips the waiting
    await store.dispatch(`signOut`)
    expect(store.state.wallet.balances).toHaveLength(0)
    await store.dispatch(`signIn`, {
      account: `default`,
      password: `1234567890`
    })
    expect(store.state.wallet.balances).toHaveLength(1)
    expect(store.state.transactions.wallet).toHaveLength(1)
  })

  it(`should restore delegates and put committed ones in the cart`, async () => {
    store.commit(`setDelegates`, lcdClientMock.state.candidates)
    store.commit(`setCommittedDelegation`, {
      candidateId: lcdClientMock.validators[0],
      value: 1
    })
    store.commit(`setUnbondingDelegations`, {
      validator_addr: lcdClientMock.validators[1],
      balance: { amount: 1 },
      min_time: new Date().toUTCString()
    })
    jest.runAllTimers() // updating is waiting if more updates coming in, this skips the waiting
    await store.dispatch(`signOut`)

    expect(
      store.state.delegation.committedDelegates[lcdClientMock.validators[0]]
    ).toBeFalsy()
    expect(
      store.state.delegation.unbondingDelegations[lcdClientMock.validators[1]]
    ).toBeFalsy()
    expect(store.state.delegation.delegates).toHaveLength(0)

    await store.dispatch(`signIn`, {
      account: `default`,
      password: `1234567890`
    })

    expect(store.state.delegates.delegates).toHaveLength(3)
    expect(
      store.state.delegation.committedDelegates[lcdClientMock.validators[0]]
    ).toBe(1)
    expect(
      store.state.delegation.unbondingDelegations[lcdClientMock.validators[1]]
    ).toEqual({
      balance: { amount: 1 },
      min_time: new Date().toUTCString()
    })
    expect(store.state.delegation.delegates).toHaveLength(1)
  })

  it(`should restore parameters and pool`, async () => {
    store.commit(`setStakingParameters`, lcdClientMock.state.stakingParameters)
    store.commit(`setGovParameters`, lcdClientMock.state.governanceParameters)
    store.commit(`setPool`, lcdClientMock.state.pool)

    jest.runAllTimers() // updating is waiting if more updates coming in, this skips the waiting
    await store.dispatch(`signOut`)

    await store.dispatch(`signIn`, {
      account: `default`,
      password: `1234567890`
    })

    expect(store.state.stakingParameters.parameters).toEqual(
      lcdClientMock.state.stakingParameters
    )
    expect(store.state.pool.pool).toEqual(lcdClientMock.state.pool)
    expect(store.state.governanceParameters.parameters).toEqual(
      lcdClientMock.state.governanceParameters
    )
  })

  it(`should throttle updating the store cache`, async () => {
    store.commit(`setWalletBalances`, [{ denom: `fabocoin`, amount: 42 }])

    // not updating yet, as it waits if there are more updates incoming
    expect(
      localStorage.getItem(`store_test-net_` + lcdClientMock.addresses[0])
    ).toBeFalsy()

    jest.runAllTimers()

    expect(
      localStorage.getItem(`store_test-net_` + lcdClientMock.addresses[0])
    ).toBeTruthy()
  })

  it(`should not crash if the stored cache is invalid`, async () => {
    store.commit(`setWalletBalances`, [{ denom: `fabocoin`, amount: 42 }])
    await store.dispatch(`signOut`)
    localStorage.setItem(`store_test-net_` + lcdClientMock.addresses[0], `xxx`)

    jest.spyOn(console, `error`).mockImplementationOnce(() => {})
    await store.dispatch(`signIn`, {
      account: `default`,
      password: `1234567890`
    })

    expect(store.state.wallet.balances).toHaveLength(0)
  })
})
