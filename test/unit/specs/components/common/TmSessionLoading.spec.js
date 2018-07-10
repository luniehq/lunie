import { mount } from "@vue/test-utils"
import htmlBeautify from "html-beautify"
import TmSessionLoading from "common/TmSessionLoading"

describe("TmSessionLoading", () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(TmSessionLoading)
  })

  it("has the expected html structure", () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it("should show connection status", () => {
    require("electron").ipcRenderer.on = (event, cb) => {
      console.log("alled", event)
      if (event === "connection-status") {
        cb(null, "HALLO WORLD")
      }
    }

    const TmSessionLoading = require("common/TmSessionLoading")
    wrapper = mount(TmSessionLoading)
    wrapper.update()
    expect(wrapper.html()).toContain("HALLO WORLD")
  })
})
