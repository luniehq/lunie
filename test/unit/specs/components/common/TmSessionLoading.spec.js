import { mount } from "@vue/test-utils"
import htmlBeautify from "html-beautify"
import TmSessionLoading from "common/TmSessionLoading"

describe("TmSessionLoading", () => {
  let wrapper

  beforeEach(() => {
    require("electron").ipcRenderer.on = (event, cb) => {
      if (event === "connection-status") {
        cb(null, "HALLO WORLD")
      }
    }
    wrapper = mount(TmSessionLoading)
  })

  it("has the expected html structure", () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it("should show connection status", () => {
    wrapper.update()
    expect(wrapper.html()).toContain("HALLO WORLD")
  })
})
