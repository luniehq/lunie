import setup from "../../../helpers/vuex-setup"
import Vuelidate from "vuelidate"
import htmlBeautify from "html-beautify"
import TmSessionSignIn from "common/TmSessionSignIn"

let instance = setup()
instance.localVue.use(Vuelidate)

describe("TmSessionSignIn", () => {
  let wrapper, store

  beforeEach(() => {
    let test = instance.mount(TmSessionSignIn)
    store = test.store
    wrapper = test.wrapper
  })

  it("has the expected html structure", () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it("should open the help modal on click", () => {
    wrapper
      .findAll(".tm-session-header a")
      .at(1)
      .trigger("click")
    expect(store.commit).toHaveBeenCalledWith("setModalHelp", true)
  })

  it("should close the modal on successful login", async () => {
    wrapper.setData({
      fields: {
        signInPassword: "1234567890",
        signInName: "default"
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
        signInName: "default"
      }
    })
    await wrapper.vm.onSubmit()
    expect(store.dispatch).toHaveBeenCalledWith("signIn", {
      password: "1234567890",
      account: "default"
    })
  })

  it("should show error if password not 10 long", () => {
    wrapper.setData({ fields: { signInPassword: "123" } })
    wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find(".tm-form-msg-error")).toBeDefined()
  })

  it("should show a notification if signin failed", async () => {
    store.dispatch = jest.fn(() => Promise.reject("Planned rejection"))
    wrapper.setData({
      fields: {
        signInPassword: "1234567890",
        signInName: "default"
      }
    })
    await wrapper.vm.onSubmit()
    expect(store.commit).toHaveBeenCalled()
    expect(store.commit.mock.calls[0][0]).toBe("notifyError")
  })

  it("should set the default password in mocked mode", async () => {
    let test = instance.mount(TmSessionSignIn, {
      getters: {
        mockedConnector: () => true
      }
    })
    store = test.store
    wrapper = test.wrapper

    expect(wrapper.vm.fields.signInPassword).toBe("1234567890")
    expect(wrapper.html()).toContain("1234567890")
    expect(wrapper.html()).toMatchSnapshot()
  })
})
