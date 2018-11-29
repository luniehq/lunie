import setup from "../../../helpers/vuex-setup"
import PageWallet from "renderer/components/wallet/PageWallet"
describe(`PageWallet`, () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(async () => {
    let instance = mount(PageWallet, {
      stubs: {
        "modal-search": `<modal-search />`,
        "tm-data-connecting": `<tm-data-connecting />`,
        "tm-data-loading": `<tm-data-loading />`
      },
      doBefore: ({ store }) => {
        store.commit(`setConnected`, true)
      }
    })
    wrapper = instance.wrapper
    store = instance.store

    await store.dispatch(`signIn`, {
      account: `default`,
      password: `1234567890`
    })
    store.commit(`setSearchQuery`, [`balances`, ``])

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

  it(`should sort the balances by denom`, () => {
    expect(wrapper.vm.filteredBalances.map(x => x.denom)).toEqual([
      `fermion`,
      `mycoin`,
      `steak`
    ])
  })

  it(`should filter the balances`, async () => {
    store.commit(`setSearchVisible`, [`balances`, true])
    store.commit(`setSearchQuery`, [`balances`, `steak`])
    // after importing the @tendermint/ui components from modules
    // the perfect scroll plugin needs a $nextTick and a wrapper.update
    // to work properly in the tests (snapshots weren't matching)
    // this has occured across multiple tests
    await wrapper.vm.$nextTick()
    wrapper.update()
    expect(wrapper.vm.filteredBalances.map(x => x.denom)).toEqual([`steak`])
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should update balances by querying wallet state`, () => {
    wrapper.vm.updateBalances()
    expect(store.dispatch).toHaveBeenCalledWith(`queryWalletState`)
  })

  it(`should show the search on click`, () => {
    wrapper.vm.setSearch(true)
    expect(store.commit).toHaveBeenCalledWith(`setSearchVisible`, [
      `balances`,
      true
    ])
  })

  it(`should list the denoms that are available`, () => {
    expect(wrapper.findAll(`.tm-li-balance`).length).toBe(3)
  })

  it(`should show the n/a message if there are no denoms`, () => {
    store.commit(`setWalletBalances`, [])
    wrapper.update()
    expect(wrapper.find(`#account_empty_msg`).exists()).toBeTruthy()
  })

  it(`should not show the n/a message if there are denoms`, () => {
    expect(wrapper.vm.allDenomBalances.length).not.toBe(0)
    expect(wrapper.vm.$el.querySelector(`#no-balances`)).toBe(null)
  })

  it(`should update 'somethingToSearch' when there's nothing to search`, () => {
    expect(wrapper.vm.somethingToSearch).toBe(true)
    store.commit(`setWalletBalances`, [])
    expect(wrapper.vm.somethingToSearch).toBe(false)
  })

  it(`should not show search when there's nothing to search`, () => {
    store.commit(`setWalletBalances`, [])
    wrapper.update()
    expect(wrapper.vm.setSearch()).toEqual(false)
  })

  it(`should show a message when still connecting`, () => {
    store.state.wallet.loaded = false
    store.state.connection.connected = false
    wrapper.update()
    expect(wrapper.exists(`tm-data-connecting`)).toBe(true)
  })

  it(`should show a message when still loading`, () => {
    store.state.wallet.loaded = false
    store.state.wallet.loading = false
    store.state.connection.connected = true
    wrapper.update()
    expect(wrapper.exists(`tm-data-loading`)).toBe(true)
  })
})
