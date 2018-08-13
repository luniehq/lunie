import setup from "../../../helpers/vuex-setup"
import PageTransactions from "renderer/components/wallet/PageTransactions"
import mockTransactions from "../../store/json/txs.js"

describe("PageTransactions", () => {
  let wrapper, store
  let { mount } = setup()
  beforeEach(() => {
    let instance = mount(PageTransactions, {
      stubs: {
        "tm-li-transaction": "<tm-li-transaction />",
        "data-empty-tx": "<data-empty-tx />"
      }
    })
    wrapper = instance.wrapper
    store = instance.store

    store.commit("setWalletAddress", "tb1d4u5zerywfjhxuc9nudvw")
    store.commit("setWalletHistory", mockTransactions)

    wrapper.update()
  })

  it("has the expected html structure", async () => {
    // after importing the @tendermint/ui components from modules
    // the perfect scroll plugin needs a $nextTick and a wrapper.update
    // to work properly in the tests (snapshots weren't matching)
    // this has occured across multiple tests
    await wrapper.vm.$nextTick()
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should show the search on click", () => {
    wrapper
      .findAll(".tm-tool-bar i")
      .at(1)
      .trigger("click")
    wrapper.update()
    expect(wrapper.contains(".tm-modal-search")).toBe(true)
  })

  it("should refresh the transaction history", () => {
    wrapper
      .findAll(".tm-tool-bar i")
      .at(0)
      .trigger("click")
    expect(store.dispatch).toHaveBeenCalledWith("queryWalletHistory")
  })

  it("should show transactions", () => {
    expect(wrapper.findAll("tm-li-transaction").length).toBe(3)
  })

  it("should sort the transaction by time", () => {
    expect(wrapper.vm.filteredTransactions.map(x => x.height)).toEqual([
      "3466",
      "3438",
      "3436"
    ])
  })

  it("should filter the transactions", () => {
    store.commit("setSearchVisible", ["transactions", true])
    store.commit("setSearchQuery", ["transactions", "fabo"])
    wrapper.update()
    expect(wrapper.vm.filteredTransactions.map(x => x.height)).toEqual(["3466"])
    // reflects the filter in the view
    expect(wrapper.vm.$el).toMatchSnapshot()
    store.commit("setSearchQuery", ["transactions", "mattc"])
    expect(wrapper.vm.filteredTransactions.map(x => x.height)).toEqual(["3466"])
  })

  it("should refresh the transactions on click", () => {
    wrapper
      .findAll(".tm-tool-bar i")
      .at(0)
      .trigger("click")

    expect(store.dispatch).toHaveBeenCalledWith("queryWalletHistory")
  })

  it("should update 'somethingToSearch' when there's nothing to search", () => {
    expect(wrapper.vm.somethingToSearch).toBe(true)
    store.commit("setWalletHistory", [])
    expect(wrapper.vm.somethingToSearch).toBe(false)
    store.commit("setWalletHistory", mockTransactions)
    expect(wrapper.vm.somethingToSearch).toBe(true)
    store.commit("setHistoryLoading", true)
    expect(wrapper.vm.somethingToSearch).toBe(false)
  })

  it("should show an error if there are no transactions", () => {
    store.commit("setWalletHistory", [])
    wrapper.update()
    expect(wrapper.contains("data-empty-tx")).toBe(true)
  })

  it("should not show search when there is nothing to search", () => {
    let transactions = []
    mount(PageTransactions, {
      stubs: {
        "tm-li-transaction": "<tm-li-transaction />",
        "data-empty-tx": "<data-empty-tx />"
      }
    })
    store.commit("setWalletHistory", transactions)
    wrapper.update()
    expect(wrapper.vm.setSearch()).toEqual(false)
  })
})
