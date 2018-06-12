import setup from "../../../helpers/vuex-setup"
import htmlBeautify from "html-beautify"
import PageStaking from "renderer/components/staking/PageStaking"

describe("PageStaking", () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(PageStaking)
    wrapper = instance.wrapper
    store = instance.store

    store.state.user.address = "abc"
    store.commit("setAtoms", 1337)
    wrapper.update()
  })

  it("has the expected html structure", () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it("should show the search on click", () => {
    wrapper.find(".ni-tool-bar i.search").trigger("click")
    expect(wrapper.contains(".ni-modal-search")).toBe(true)
  })

  it("should refresh candidates on click", () => {
    wrapper
      .findAll(".ni-tool-bar i")
      .at(1)
      .trigger("click")
    expect(store.dispatch).toHaveBeenCalledWith("getDelegates")
  })

  it("should sort the delegates by selected property", () => {
    expect(wrapper.vm.filteredDelegates.map(x => x.owner)).toEqual([
      "70705055A9FA5901735D0C3F0954501DDE667327",
      "760ACDE75EFC3DD0E4B2A6A3B96D91C05349EA31",
      "77C26DF82654C5A5DDE5C6B7B27F3F06E9C223C0"
    ])

    wrapper.vm.sort.property = "owner"
    wrapper.vm.sort.order = "desc"
    expect(wrapper.vm.filteredDelegates.map(x => x.owner)).toEqual([
      "77C26DF82654C5A5DDE5C6B7B27F3F06E9C223C0",
      "760ACDE75EFC3DD0E4B2A6A3B96D91C05349EA31",
      "70705055A9FA5901735D0C3F0954501DDE667327"
    ])
  })

  it("should filter the delegates", () => {
    store.commit("setSearchVisible", ["delegates", true])
    store.commit("setSearchQuery", ["delegates", "c26d"])
    expect(wrapper.vm.filteredDelegates.map(x => x.owner)).toEqual([
      "77C26DF82654C5A5DDE5C6B7B27F3F06E9C223C0"
    ])
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
    store.commit("setSearchQuery", ["delegates", "7070"])
    expect(wrapper.vm.filteredDelegates.map(x => x.owner)).toEqual([
      "70705055A9FA5901735D0C3F0954501DDE667327"
    ])
  })

  it("should show the amount of selected delegates", () => {
    store.commit("addToCart", store.state.delegates.delegates[0])
    store.commit("addToCart", store.state.delegates.delegates[1])
    wrapper.update()
    expect(
      wrapper
        .find(".fixed-button-bar strong")
        .text()
        .trim()
    ).toContain("2")
  })

  it("should update 'somethingToSearch' when there's nothing to search", () => {
    expect(wrapper.vm.somethingToSearch).toBe(true)
    let delegates = store.state.delegates.delegates
    store.commit("setDelegates", [])
    expect(wrapper.vm.somethingToSearch).toBe(false)

    store.commit("setDelegates", delegates)
    expect(wrapper.vm.somethingToSearch).toBe(true)
    store.commit("setDelegateLoading", true)
    expect(wrapper.vm.somethingToSearch).toBe(false)
  })

  it("should show placeholder if delegates are loading", () => {
    let { wrapper } = mount(PageStaking, {
      getters: {
        delegates: () => ({
          delegates: [],
          loading: true
        })
      },
      stubs: { "data-loading": "<data-loading />" }
    })

    expect(wrapper.contains("data-loading")).toBe(true)
  })

  it("should not show search when there is nothing to search", () => {
    let { wrapper } = mount(PageStaking, {
      getters: {
        delegates: () => ({
          delegates: [],
          loading: true
        })
      },
      stubs: { "data-loading": "<data-loading />" }
    })
    wrapper.update()

    expect(wrapper.vm.setSearch()).toEqual(false)
  })
})
