import setup from "../../../helpers/vuex-setup"
import PageProfile from "renderer/components/common/PageProfile"
jest.mock("renderer/google-analytics.js", () => uid => {})

describe("PageProfile", () => {
  let wrapper, store
  let instance = setup()

  beforeEach(async () => {
    let test = instance.mount(PageProfile)
    wrapper = test.wrapper
    store = test.store

    await store.dispatch("signIn", {
      account: "default",
      password: "1234567890"
    })
  })

  it("has the expected html structure if connected", () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.vm.$el.outerHTML).toContain("default")
    expect(wrapper.vm.$el.outerHTML).toContain("someaddress")
  })

  it("should sign the user out", async () => {
    wrapper.vm.signOut()
    expect(store.dispatch).toHaveBeenCalledWith("signOut")
    expect(store.commit).toHaveBeenCalledWith("notifySignOut")
  })

  it("should set the error collection opt in", async () => {
    let errorCollection = wrapper.vm.user.errorCollection
    wrapper.vm.setErrorCollection()
    expect(store.dispatch).toHaveBeenCalledWith("setErrorCollection", {
      account: "default",
      optin: !errorCollection
    })
    expect(wrapper.vm.user.errorCollection).not.toBe(errorCollection)
  })
})
