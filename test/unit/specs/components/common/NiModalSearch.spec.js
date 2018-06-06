import NiModalSearch from "common/NiModalSearch"
import setup from "../../../helpers/vuex-setup"
import Vuelidate from "vuelidate"

describe("NiModalSearch", () => {
  let wrapper, store
  let { mount, localVue } = setup()

  beforeEach(() => {
    let instance = mount(NiModalSearch, { propsData: { type: "transactions" } })
    localVue.use(Vuelidate)
    store = instance.store
    wrapper = instance.wrapper
    store.commit("setSearchVisible", ["transactions", true])
    wrapper.update()
  })

  it("has the expected html structure", () => {
    expect(wrapper.html()).not.toBeUndefined()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should close", () => {
    wrapper.find("button").trigger("click")
    expect(store.commit).toHaveBeenCalledWith("setSearchVisible", [
      "transactions",
      false
    ])
    expect(wrapper.html()).toBeUndefined()
  })

  it("should show search query", () => {
    store.commit("setSearchQuery", ["transactions", "abc"])
    expect(wrapper.vm.query).toBe("abc")
  })

  it("should update the search query", () => {
    wrapper.vm.query = "def"
    expect(store.commit).toHaveBeenCalledWith("setSearchQuery", [
      "transactions",
      "def"
    ])
  })

  it("should show find button on blocks", () => {
    wrapper.setProps({ type: "blocks" })
    store.commit("setSearchVisible", ["blocks", true])
    store.commit("setSearchVisible", ["transactions", false])
    wrapper.update()

    expect(
      wrapper
        .find(".ni-modal-search-field .ni-btn__value")
        .text()
        .trim()
    ).toBe("Find")
  })

  it("should go to block", () => {
    wrapper.vm.$router.go("balances")
    wrapper.setProps({ type: "blocks" })
    store.commit("setSearchVisible", ["blocks", true])
    expect(wrapper.vm.$route.name).toBe("balances")
    wrapper.vm.query = "1"
    wrapper.vm.gotoBlock()
    expect(wrapper.vm.$route.name).toBe("block")
  })
})
