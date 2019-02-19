import setup from "../../../helpers/vuex-setup"
import PageTransactions from "renderer/components/wallet/PageTransactions"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`PageTransactions`, () => {
  let wrapper, store
  const { stakingParameters, txs } = lcdClientMock.state

  const { mount } = setup()
  beforeEach(async () => {
    const instance = mount(PageTransactions, {
      stubs: {
        "tm-li-any-transaction": true,
        "data-empty-tx": true,
        "data-empty-search": true,
        "tm-data-error": true,
        "modal-search": true,
        "short-bech32": true
      }
    })
    wrapper = instance.wrapper
    store = instance.store

    store.commit(`setConnected`, true)
    store.commit(`setSignIn`, true)
    store.commit(`setWalletAddress`, `tb1d4u5zerywfjhxuc9nudvw`)
    store.commit(`setStakingParameters`, stakingParameters.parameters)
    store.commit(`setWalletTxs`, txs.slice(0, 2))
    store.commit(`setStakingTxs`, txs.slice(4))
    store.commit(`setGovernanceTxs`, txs.slice(2, 4))
    store.commit(`setHistoryLoading`, false)
  })

  describe(`has the expected html structure`, () => {
    it(`if user has signed in`, async () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`if user hasn't signed in`, async () => {
      store.commit(`setSignIn`, false)
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  it(`should show the search on click`, () => {
    wrapper.find(`.search-button`).trigger(`click`)
    expect(wrapper.contains(`modal-search-stub`)).toBe(true)
  })

  it(`should refresh the transaction history`, async () => {
    await wrapper.vm.refreshTransactions()
    expect(store.dispatch).toHaveBeenCalledWith(`getAllTxs`)
  })

  it(`should show transactions`, async () => {
    expect(wrapper.findAll(`tm-li-any-transaction-stub`).length).toBe(6)
  })

  it(`should sort the transaction by time`, () => {
    expect(wrapper.vm.filteredTransactions.map(x => x.height)).toEqual([
      56673,
      213,
      170,
      160,
      150,
      1
    ])
  })

  it(`should filter the transactions`, () => {
    store.commit(`setSearchVisible`, [`transactions`, true])
    store.commit(`setSearchQuery`, [`transactions`, `fabo`])
    expect(wrapper.vm.filteredTransactions.map(x => x.height)).toEqual([150])
    // reflects the filter in the view
    expect(wrapper.vm.$el).toMatchSnapshot()
    store.commit(`setSearchQuery`, [`transactions`, `jb`])
    expect(wrapper.vm.filteredTransactions.map(x => x.height)).toEqual([1])
  })
})
