import setup from "../../../helpers/vuex-setup"
import PageTransactions from "renderer/components/wallet/PageTransactions"
import mockTransactions from "../../store/json/txs.js"
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
        "modal-search": true
      },
      methods: {
        refreshTransactions: jest.fn() // we don't want to call getAllTxs on mount
      }
    })
    wrapper = instance.wrapper
    store = instance.store

    store.commit(`setConnected`, true)
    store.commit(`setWalletAddress`, `tb1d4u5zerywfjhxuc9nudvw`)
    store.commit(`setStakingParameters`, stakingParameters.parameters)
    store.commit(`setWalletTxs`, txs.slice(0, 2))
    store.commit(`setStakingTxs`, txs.slice(4))
    store.commit(`setGovernanceTxs`, txs.slice(2, 4))
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show the search on click`, () => {
    wrapper.find(`.search-button`).trigger(`click`)
    expect(wrapper.contains(`modal-search-stub`)).toBe(true)
  })

  it(`should refresh the transaction history`, () => {
    wrapper.vm.refreshTransactions = jest.fn()
    wrapper.find(`.refresh-button`).trigger(`click`)
    expect(wrapper.vm.refreshTransactions).toHaveBeenCalled()
  })

  it(`should show transactions`, () => {
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

  it(`should update 'somethingToSearch' when there's nothing to search`, () => {
    expect(wrapper.vm.somethingToSearch).toBe(true)
    store.commit(`setWalletTxs`, [])
    store.commit(`setStakingTxs`, [])
    store.commit(`setGovernanceTxs`, [])
    expect(wrapper.vm.somethingToSearch).toBe(false)
    store.commit(`setWalletTxs`, mockTransactions)
    expect(wrapper.vm.somethingToSearch).toBe(true)
    store.commit(`setHistoryLoading`, true)
    expect(wrapper.vm.somethingToSearch).toBe(false)
  })

  it(`should show an error if there are no transactions`, () => {
    store.commit(`setWalletTxs`, [])
    store.commit(`setStakingTxs`, [])
    store.commit(`setGovernanceTxs`, [])
    expect(wrapper.contains(`data-empty-tx-stub`)).toBe(true)
    expect(wrapper.contains(`data-empty-search-stub`)).toBe(false)
  })

  it(`should not show search when there is nothing to search`, () => {
    store.commit(`setWalletTxs`, [])
    store.commit(`setStakingTxs`, [])
    store.commit(`setGovernanceTxs`, [])
    wrapper.find(`.search-button`).trigger(`click`)
    expect(wrapper.contains(`modal-search-stub`)).toBe(false)
  })
})
