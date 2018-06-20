import Vuex from "vuex"
import { mount, createLocalVue } from "@vue/test-utils"
import htmlBeautify from "html-beautify"
import NiModalError from "common/NiModalError"

const localVue = createLocalVue()
localVue.use(Vuex)

jest.mock("electron", () => ({
  remote: {
    getGlobal: () => {
      return "$HOME/.cosmos-voyager-dev"
    }
  }
}))

describe("NiModalError", () => {
  let wrapper
  let store = new Vuex.Store({
    getters: {
      config: () => ({ devMode: true }),
      lastHeader: () => ({ chain_id: "gaia-test", height: "31337" })
    }
  })

  beforeEach(() => {
    wrapper = mount(NiModalError, {
      localVue,
      store
    })
  })

  it("has the expected html structure", () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it("has an icon", () => {
    expect(
      wrapper
        .find(".tm-modal-error__icon i.material-icons")
        .text()
        .trim()
    ).toBe("error_outline")
  })

  it("shows an icon if specified", () => {
    wrapper = mount(NiModalError, {
      localVue,
      store,
      propsData: { icon: "icon-x" }
    })
    expect(
      wrapper
        .find(".tm-modal-error__icon i.material-icons")
        .text()
        .trim()
    ).toBe("icon-x")
  })

  it("has a title", () => {
    expect(
      wrapper
        .find(".tm-modal-error__title")
        .text()
        .trim()
    ).toBe("Voyager ran into an error")
  })

  it("shows a title if specified", () => {
    wrapper = mount(NiModalError, {
      localVue,
      store,
      propsData: { title: "title-x" }
    })
    expect(
      wrapper
        .find(".tm-modal-error__title")
        .text()
        .trim()
    ).toBe("title-x")
  })

  it("has a body", () => {
    expect(
      wrapper
        .find(".tm-modal-error__body")
        .text()
        .trim()
    ).toContain(
      "Voyager has encountered a critical error that blocks the app from running. Please create an issue and include a copy of the app logs."
    )
  })

  it("shows a body if specified", () => {
    wrapper = mount(NiModalError, {
      localVue,
      store,
      propsData: { body: "body-x" }
    })
    expect(
      wrapper
        .find(".tm-modal-error__body")
        .text()
        .trim()
    ).toBe("body-x")
  })

  it("knows the path to the app log", () => {
    expect(wrapper.vm.logPath).toBe("$HOME/.cosmos-voyager-dev/main.log")
  })

  it("has a button to create an issue", () => {
    wrapper.find("#tm-modal-error__btn-issue").trigger("click")
  })

  it("has a button to view the app logs", () => {
    wrapper.find("#tm-modal-error__btn-logs").trigger("click")
  })
})
