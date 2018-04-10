import setup from "../../../helpers/vuex-setup"
import Vuelidate from "vuelidate"
import htmlBeautify from "html-beautify"
import NiSessionSignIn from "common/NiSessionSignIn"

let instance = setup()
instance.localVue.use(Vuelidate)

describe("NiSessionSignIn", () => {
  let wrapper, store

  beforeEach(() => {
    let test = instance.mount(NiSessionSignIn)
    store = test.store
    wrapper = test.wrapper
  })

  it("has the expected html structure", () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it("should open the help modal on click", () => {
    wrapper
      .findAll(".ni-session-header a")
      .at(1)
      .trigger("click")
    expect(store.commit).toHaveBeenCalledWith("setModalHelp", true)
  })

  it("should close the modal on successful login", async () => {
    wrapper.setData({
      fields: {
        signInPassword: "1234567890",
        signInName: "name"
      }
    })
    await wrapper.vm.onSubmit()
    let calls = store.commit.mock.calls.map(args => args[0])
    expect(calls).toContain("setModalSession")
  })

  it("should signal signedin state on successful login", async () => {
    wrapper.setData({
      fields: {
        signInPassword: "1234567890",
        signInName: "name"
      }
    })
    await wrapper.vm.onSubmit()
    expect(store.dispatch).toHaveBeenCalledWith("signIn", {
      password: "1234567890",
      account: "name"
    })
  })

  it("should show error if password not 10 long", () => {
    wrapper.setData({ fields: { signInPassword: "123" } })
    wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find(".ni-form-msg-error")).toBeDefined()
  })

  it("should show a notification if signin failed", async () => {
    store.dispatch = jest.fn(() => Promise.reject("Planned rejection"))
    wrapper.setData({
      fields: {
        signInPassword: "1234567890",
        signInName: "name"
      }
    })
    await wrapper.vm.onSubmit()
    expect(store.commit).toHaveBeenCalled()
    expect(store.commit.mock.calls[0][0]).toBe("notifyError")
  })
})
