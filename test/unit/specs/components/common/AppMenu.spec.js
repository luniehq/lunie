import AppMenu from "common/AppMenu"
import htmlBeautify from "html-beautify"
import setup from "../../../helpers/vuex-setup"

describe("AppMenu", () => {
  let wrapper, store, instance
  let { mount } = setup()

  beforeEach(async () => {
    instance = mount(AppMenu)
    store = instance.store
    wrapper = instance.wrapper
    await store.dispatch("signIn", {
      account: "default",
      password: "1234567890"
    })
    wrapper.update()
  })

  it("has the expected html structure", () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it("checks whether current page is validators", () => {
    expect(wrapper.vm.isValidatorPage).toBeFalsy()
  })

  it("has a perfect scrollbar", () => {
    expect(wrapper.vm.ps).toBeDefined()
  })

  it("shows staking page because of mocked connector", () => {
    expect(wrapper.find("#app-menu__staking")).toBeDefined()
  })

  it("shows transactions page because of mocked connector", () => {
    expect(wrapper.find("#app-menu__transactions")).toBeDefined()
  })

  it("can close the app menu", () => {
    wrapper.find("#app-menu__wallet").trigger("click")
    expect(store.commit).toHaveBeenCalled()
    expect(store.commit.mock.calls[0][0]).toBe("setActiveMenu")
    expect(store.commit.mock.calls[0][1]).toBeFalsy()
  })
})
