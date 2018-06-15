import setup from "../../../helpers/vuex-setup"
import htmlBeautify from "html-beautify"
import PageStaking from "renderer/components/staking/PageStaking"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

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
    expect(store.dispatch).toHaveBeenCalledWith("updateDelegates")
  })

  it("should sort the delegates by selected property", () => {
    expect(wrapper.vm.filteredDelegates.map(x => x.owner)).toEqual(
      lcdClientMock.validators
    )

    wrapper.vm.sort.property = "owner"
    wrapper.vm.sort.order = "asc"
    expect(wrapper.vm.filteredDelegates.map(x => x.owner)).toEqual(
      lcdClientMock.validators.reverse()
    )
  })

  it("should filter the delegates", () => {
    store.commit("setSearchVisible", ["delegates", true])
    store.commit("setSearchQuery", [
      "delegates",
      lcdClientMock.validators[2].substr(20, 26)
    ])
    expect(wrapper.vm.filteredDelegates.map(x => x.owner)).toEqual([
      lcdClientMock.validators[2]
    ])
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
    store.commit("setSearchQuery", [
      "delegates",
      lcdClientMock.validators[1].substr(20, 26)
    ])
    expect(wrapper.vm.filteredDelegates.map(x => x.owner)).toEqual([
      lcdClientMock.validators[1]
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
