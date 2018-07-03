import setup from "../../../helpers/vuex-setup"
import PageWallet from "renderer/components/wallet/PageWallet"

describe("PageWallet", () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(PageWallet, {
      stubs: { "modal-search": "<modal-search />" }
    })
    wrapper = instance.wrapper
    store = instance.store

    store.commit("setDenoms", ["ATOM", "FERMION", "TEST"])
    store.commit("setWalletAddress", "tb1zgatc3tdauv2m0uf")

    store.commit("setWalletBalances", [
      {
        denom: "ATOM",
        amount: 123
      },
      {
        denom: "FERMION",
        amount: 456
      }
    ])
    store.commit("setCommittedDelegation", { candidateId: "foo", value: 123 })
    store.commit("setSearchQuery", ["balances", ""])

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

  it("should sort the balances by denom", () => {
    expect(wrapper.vm.filteredBalances.map(x => x.denom)).toEqual([
      "FERMION",
      "ATOM",
      "TEST"
    ])
  })

  it("should filter the balances", async () => {
    store.commit("setSearchVisible", ["balances", true])
    store.commit("setSearchQuery", ["balances", "atom"])
    // after importing the @tendermint/ui components from modules
    // the perfect scroll plugin needs a $nextTick and a wrapper.update
    // to work properly in the tests (snapshots weren't matching)
    // this has occured across multiple tests
    await wrapper.vm.$nextTick()
    wrapper.update()
    expect(wrapper.vm.filteredBalances.map(x => x.denom)).toEqual(["ATOM"])
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should update balances by querying wallet state", () => {
    wrapper.vm.updateBalances()
    expect(store.dispatch).toHaveBeenCalledWith("queryWalletState")
  })

  it("should show the search on click", () => {
    wrapper.vm.setSearch(true)
    expect(store.commit).toHaveBeenCalledWith("setSearchVisible", [
      "balances",
      true
    ])
  })

  it("should list the denoms that are available", () => {
    expect(wrapper.findAll(".tm-li-balance").length).toBe(2)
  })

  it("should show the n/a message if there are no denoms", () => {
    let { store, wrapper } = mount(PageWallet, {
      "data-empty": "<data-empty />"
    })
    store.commit("setWalletBalances", [])
    wrapper.update()
    expect(wrapper.find("data-empty")).toBeDefined()
  })

  it("should not show the n/a message if there are denoms", () => {
    wrapper.update()
    expect(wrapper.vm.allDenomBalances.length).not.toBe(0)
    expect(wrapper.vm.$el.querySelector("#no-balances")).toBe(null)
  })

  it("has a title for available balances", () => {
    expect(
      wrapper
        .find("#part-available-balances .tm-part-title")
        .text()
        .trim()
    ).toBe("Available Balances")
  })

  it("has a title for staked balances", () => {
    expect(
      wrapper
        .find("#part-staked-balances .tm-part-title")
        .text()
        .trim()
    ).toBe("Staked Balances")
  })

  it("has shows the correct number of staked tokens", async () => {
    // after importing the @tendermint/ui components from modules
    // the perfect scroll plugin needs a $nextTick and a wrapper.update
    // to work properly in the tests (snapshots weren't matching)
    // this has occured across multiple tests
    await wrapper.vm.$nextTick()
    wrapper.update()
    expect(
      wrapper
        .find("#part-staked-balances .tm-li-dd")
        .text()
        .trim()
    ).toBe("123")
  })

  it("should update 'somethingToSearch' when there's nothing to search", () => {
    expect(wrapper.vm.somethingToSearch).toBe(true)
    store.commit("setWalletBalances", [])
    expect(wrapper.vm.somethingToSearch).toBe(false)
  })

  it("should not show search when there's nothing to search", () => {
    store.commit("setWalletBalances", [])
    wrapper.update()
    expect(wrapper.vm.setSearch()).toEqual(false)
  })

  it("has a number of staked tokens", () => {
    expect(wrapper.vm.stakedTokens).toBe(123)
  })

  it("has a label for the staking denomination", () => {
    expect(wrapper.vm.stakingDenom).toBe("STEAK")
  })
})
