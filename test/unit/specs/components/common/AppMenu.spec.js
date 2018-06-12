import AppMenu from "common/AppMenu"
import htmlBeautify from "html-beautify"
import setup from "../../../helpers/vuex-setup"

describe("AppMenu", () => {
  let wrapper, router, store, instance
  let { mount } = setup()

  beforeEach(async () => {
    instance = mount(AppMenu)
    store = instance.store
    router = instance.router
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
})
