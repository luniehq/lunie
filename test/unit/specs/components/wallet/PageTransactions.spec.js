import setup from "../../../helpers/vuex-setup"
import PageTransactions from "renderer/components/wallet/PageTransactions"
import mockTransactions from "../../store/json/txs.js"

describe("PageTransactions", () => {
  let wrapper, store
  let { mount } = setup()
  beforeEach(() => {
    let instance = mount(PageTransactions, {
      stubs: {
        "li-transaction": "<li-transaction />",
        "data-empty-tx": "<data-empty-tx />"
      }
    })
    wrapper = instance.wrapper
    store = instance.store

    jest.mock("axios", () => ({
      get: () => mockTransactions
    }))
    store.commit("setWalletAddress", "tb1d4u5zerywfjhxuc9nudvw")
    store.commit("setWalletHistory", mockTransactions)

    wrapper.update()
  })

  it("has the expected html structure", async () => {
    await wrapper.vm.$nextTick()
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should show the search on click", () => {
    wrapper.find(".tm-tool-bar i").trigger("click")
    expect(wrapper.contains(".tm-modal-search")).toBe(true)
  })

  it("should show transactions", () => {
    expect(wrapper.findAll("li-transaction").length).toBe(3)
  })

  it("should sort the transaction by time", () => {
    expect(wrapper.vm.filteredTransactions.map(x => x.height)).toEqual([
      3466,
      3438,
      3436
    ])
  })

  it("should filter the transactions", () => {
    store.commit("setSearchVisible", ["transactions", true])
    store.commit("setSearchQuery", ["transactions", "fabo"])
    wrapper.update()
    expect(wrapper.vm.filteredTransactions.map(x => x.height)).toEqual([3466])
    // reflects the filter in the view
    expect(wrapper.vm.$el).toMatchSnapshot()
    store.commit("setSearchQuery", ["transactions", "mattc"])
    expect(wrapper.vm.filteredTransactions.map(x => x.height)).toEqual([3466])
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
    let instance = mount(PageTransactions, {
      stubs: {
        "li-transaction": "<li-transaction />",
        "data-empty-tx": "<data-empty-tx />"
      }
    })
    store.commit("setWalletHistory", transactions)
    wrapper.update()
    expect(wrapper.vm.setSearch()).toEqual(false)
  })
})
