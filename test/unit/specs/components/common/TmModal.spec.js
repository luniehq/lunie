import { mount } from "@vue/test-utils"
import TmModal from "common/TmModal"

describe("TmModal", () => {
  let wrapper, close

  beforeEach(() => {
    close = jest.fn()
    wrapper = mount(TmModal, {
      propsData: {
        size: null,
        icon: null,
        close
      }
    })
  })

  it("has the expected html structure", () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should call close on click", () => {
    wrapper.trigger("click")
    expect(close).toHaveBeenCalled()
  })

  it("should call close button click", () => {
    wrapper.find(".tm-modal-close").trigger("click")
    expect(close).toHaveBeenCalled()
  })

  it("should set size", () => {
    wrapper.setProps({ size: "fs" })
    expect(wrapper.classes()).toContain("tm-modal-fullscreen")
  })

  it("should show icon", () => {
    wrapper.setProps({ icon: "hallo_icon" })
    expect(wrapper.find(".material-icons")).toBeDefined()
    expect(wrapper.html()).toContain("hallo_icon")
  })

  it("should use slots", () => {
    wrapper = mount(TmModal, {
      slots: {
        title: "<custom-title />",
        footer: "<custom-footer />"
      }
    })
    expect(wrapper.find("custom-title")).toBeDefined()
    expect(wrapper.find("custom-footer")).toBeDefined()
  })
})
