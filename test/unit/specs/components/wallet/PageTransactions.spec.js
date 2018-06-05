import setup from "../../../helpers/vuex-setup"
import PageTransactions from "renderer/components/wallet/PageTransactions"

describe("PageTransactions", () => {
  let wrapper, store
  let { mount } = setup()
  let transactions = [
    {
      tx: {
        hash: "x",
        inputs: [
          {
            coins: [
              {
                denom: "jbcoins",
                amount: 1234
              }
            ],
            sender: "myAddress"
          }
        ],
        outputs: [
          {
            coins: [
              {
                denom: "jbcoins",
                amount: 1234
              }
            ],
            recipient: "otherAddress"
          }
        ]
      },
      time: Date.now()
    },
    {
      tx: {
        hash: "y",
        inputs: [
          {
            coins: [
              {
                denom: "fabocoins",
                amount: 1234
              }
            ],
            sender: "otherAddress"
          }
        ],
        outputs: [
          {
            coins: [
              {
                denom: "fabocoins",
                amount: 1234
              }
            ],
            recipient: "myAddress"
          }
        ]
      },
      time: Date.now() + 10
    }
  ]
  beforeEach(() => {
    let instance = mount(PageTransactions, {
      stubs: {
        "li-transaction": "<li-transaction />",
        "data-empty-tx": "<data-empty-tx />"
      }
    })
    wrapper = instance.wrapper
    store = instance.store

    // store.commit("setWalletAddress", "myAddress")
    store.commit("setWalletAddress", "tb1d4u5zerywfjhxuc9nudvw")
    store.commit("setWalletHistory", transactions)

    wrapper.update()
  })

  it("has the expected html structure", () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should show the search on click", () => {
    wrapper.find(".ni-tool-bar i").trigger("click")
    expect(wrapper.contains(".ni-modal-search")).toBe(true)
  })

  it("should show transactions", () => {
    expect(wrapper.findAll("li-transaction").length).toBe(2)
  })

  it("should sort the transaction by time", () => {
    expect(wrapper.vm.filteredTransactions.map(x => x.tx.hash)).toEqual([
      "y",
      "x"
    ])
  })

  it("should filter the transactions", () => {
    store.commit("setSearchVisible", ["transactions", true])
    store.commit("setSearchQuery", ["transactions", "fabo"])
    wrapper.update()
    expect(wrapper.vm.filteredTransactions.map(x => x.tx.hash)).toEqual(["y"])
    // reflects the filter in the view
    expect(wrapper.vm.$el).toMatchSnapshot()
    store.commit("setSearchQuery", ["transactions", "jb"])
    expect(wrapper.vm.filteredTransactions.map(x => x.tx.hash)).toEqual(["x"])
  })

  it("should update 'somethingToSearch' when there's nothing to search", () => {
    expect(wrapper.vm.somethingToSearch).toBe(true)
    store.commit("setWalletHistory", [])
    expect(wrapper.vm.somethingToSearch).toBe(false)
    store.commit("setWalletHistory", transactions)
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
