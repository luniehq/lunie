import Vuex from "vuex"
import Vuelidate from "vuelidate"
import { mount, createLocalVue } from "@vue/test-utils"
import htmlBeautify from "html-beautify"
import NiSessionImport from "common/NiSessionImport"
jest.mock("renderer/google-analytics.js", () => uid => {})
const seed =
  "goose toward escape engine wheel board help torch avocado educate rose rebel rigid side aspect abandon"
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)

describe("NiSessionImport", () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store()
    wrapper = mount(NiSessionImport, {
      localVue,
      store
    })
    store.commit = jest.fn()
    store.dispatch = jest.fn(async () => true)
  })

  it("has the expected html structure", () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it("should go back to the welcome screen on click", () => {
    wrapper
      .findAll(".tm-session-header a")
      .at(0)
      .trigger("click")
    expect(store.commit.mock.calls[0][0]).toBe("setModalSessionState")
    expect(store.commit.mock.calls[0][1]).toBe("welcome")
  })

  it("should open the help modal on click", () => {
    wrapper
      .findAll(".tm-session-header a")
      .at(1)
      .trigger("click")
    expect(store.commit.mock.calls[0]).toEqual(["setModalHelp", true])
  })

  it("should close the modal on successful login", async () => {
    wrapper.setData({
      fields: {
        importName: "foo123",
        importPassword: "1234567890",
        importPasswordConfirm: "1234567890",
        importSeed: seed
      }
    })
    await wrapper.vm.onSubmit()

    expect(
      store.commit.mock.calls.find(
        ([action, _]) => action === "setModalSession"
      )[1]
    ).toBe(false)
  })

  it("should signal signed in state on successful login", async () => {
    wrapper.setData({
      fields: {
        importName: "foo123",
        importPassword: "1234567890",
        importPasswordConfirm: "1234567890",
        importSeed: seed
      }
    })
    await wrapper.vm.onSubmit()
    expect(
      store.commit.mock.calls
        .find(([action, _]) => action === "notify")[1]
        .title.toLowerCase()
    ).toContain("welcome back!")
    expect(store.dispatch).toHaveBeenCalledWith("signIn", {
      account: "foo123",
      password: "1234567890"
    })
  })

  it("should set error collection opt in state", async () => {
    wrapper.setData({
      fields: {
        importName: "foo123",
        importPassword: "1234567890",
        importPasswordConfirm: "1234567890",
        importSeed: seed,
        errorCollection: true
      }
    })
    await wrapper.vm.onSubmit()
    expect(
      store.dispatch.mock.calls.find(
        ([action, _]) => action === "setErrorCollection"
      )[1]
    ).toMatchObject({
      account: "foo123",
      optin: true
    })

    wrapper.setData({
      fields: {
        importName: "foo123",
        importPassword: "1234567890",
        importPasswordConfirm: "1234567890",
        importSeed: seed,
        errorCollection: false
      }
    })
    store.dispatch.mockClear()
    await wrapper.vm.onSubmit()
    expect(
      store.dispatch.mock.calls.find(
        ([action, _]) => action === "setErrorCollection"
      )[1]
    ).toMatchObject({
      account: "foo123",
      optin: false
    })
  })

  it("should show error if seed is not filled in", async () => {
    wrapper.setData({ fields: { importSeed: "" } })
    await wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find(".tm-form-msg-error")).toBeDefined()
  })

  it("should show error if seed is 16 words long", async () => {
    wrapper.setData({
      fields: {
        importSeed: "asdf asdf asdf asdf"
      }
    })
    await wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find(".tm-form-msg-error")).toBeDefined()
  })

  it("should show error if password is not confirmed", async () => {
    wrapper.setData({
      fields: {
        importName: "foo123",
        importPassword: "1234567890",
        importPasswordConfirm: "notthesame",
        importSeed: seed
      }
    })
    await wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find(".tm-form-msg-error")).toBeDefined()
  })

  it("should not continue if creation failed", async () => {
    store.dispatch = jest.fn(() => Promise.resolve(null))
    wrapper.setData({
      fields: {
        importName: "foo123",
        importPassword: "1234567890",
        importPasswordConfirm: "1234567890",
        importSeed: seed
      }
    })
    await wrapper.vm.onSubmit()
    expect(store.commit).not.toHaveBeenCalled()
  })

  it("should show a notification if creation failed", async () => {
    store.dispatch = jest.fn(() => Promise.reject({ message: "test" }))
    wrapper.setData({
      fields: {
        importName: "foo123",
        importPassword: "1234567890",
        importPasswordConfirm: "1234567890",
        importSeed: seed
      }
    })
    await wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0][0]).toEqual("notifyError")
    expect(store.commit.mock.calls[0][1].body).toEqual("test")
  })
})
