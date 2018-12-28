import setup from "../../../helpers/vuex-setup"
import PageTransactions from "renderer/components/wallet/PageTransactions"
import mockTransactions from "../../store/json/txs.js"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`PageTransactions`, () => {
  let wrapper, store
  let { mount } = setup()
  beforeEach(async () => {
    let instance = mount(PageTransactions, {
      stubs: {
        "tm-li-any-transaction": `<tm-li-any-transaction />`,
        "tm-li-staking-transaction": `<tm-li-staking-transaction />`,
        "data-empty-tx": `<data-empty-tx />`,
        "data-empty-search": `<data-empty-search />`,
        "tm-data-error": `<tm-data-error />`
      },
      methods: {
        refreshTransactions: jest.fn() // we don't want to call getAllTxs on mount
      }
    })
    wrapper = instance.wrapper
    store = instance.store

    store.commit(`setConnected`, true)
    store.commit(`setWalletAddress`, `tb1d4u5zerywfjhxuc9nudvw`)
    store.commit(`setWalletTxs`, mockTransactions)
    store.commit(`setStakingTxs`, lcdClientMock.state.txs.slice(4))
    store.commit(`setGovernanceTxs`, lcdClientMock.state.txs.slice(2, 4))
    wrapper.update()
  })

  it(`has the expected html structure`, async () => {
    // after importing the @tendermint/ui components from modules
    // the perfect scroll plugin needs a $nextTick and a wrapper.update
    // to work properly in the tests (snapshots weren't matching)
    // this has occured across multiple tests
    await wrapper.vm.$nextTick()
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show the search on click`, () => {
    wrapper
      .findAll(`.tm-tool-bar i`)
      .at(2)
      .trigger(`click`)
    wrapper.update()
    expect(wrapper.contains(`.tm-modal-search`)).toBe(true)
  })

  it(`should refresh the transaction history`, () => {
    wrapper.vm.refreshTransactions = jest.fn()
    wrapper
      .findAll(`.tm-tool-bar i`)
      .at(1)
      .trigger(`click`)
    expect(wrapper.vm.refreshTransactions).toHaveBeenCalled()
  })

  it(`should show transactions`, () => {
    expect(wrapper.findAll(`tm-li-any-transaction`).length).toBe(5)
  })

  it(`should sort the transaction by time`, () => {
    expect(wrapper.vm.filteredTransactions.map(x => x.height)).toEqual([
      3438,
      3436,
      466,
      170,
      160
    ])
  })

  it(`should filter the transactions`, () => {
    store.commit(`setSearchVisible`, [`transactions`, true])
    store.commit(`setSearchQuery`, [`transactions`, `fabo`])
    wrapper.update()
    expect(wrapper.vm.filteredTransactions.map(x => x.height)).toEqual([466])
    // reflects the filter in the view
    expect(wrapper.vm.$el).toMatchSnapshot()
    store.commit(`setSearchQuery`, [`transactions`, `mattc`])
    expect(wrapper.vm.filteredTransactions.map(x => x.height)).toEqual([466])
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
    store.commit(`setConnected`, true)
    store.commit(`setWalletTxs`, [])
    store.commit(`setStakingTxs`, [])
    store.commit(`setGovernanceTxs`, [])
    wrapper.update()
    expect(wrapper.contains(`data-empty-tx`)).toBe(true)
    expect(wrapper.contains(`data-empty-search`)).toBe(false)
  })

  it(`should not show search when there is nothing to search`, () => {
    mount(PageTransactions, {
      stubs: {
        "tm-li-transaction": `<tm-li-transaction />`,
        "data-empty-tx": `<data-empty-tx />`
      },
      methods: {
        refreshTransactions: jest.fn() // we don't want to call getAllTxs on mount
      }
    })
    store.commit(`setWalletTxs`, [])
    store.commit(`setStakingTxs`, [])
    store.commit(`setGovernanceTxs`, [])
    wrapper.update()
    expect(wrapper.vm.setSearch()).toEqual(false)
  })
})
