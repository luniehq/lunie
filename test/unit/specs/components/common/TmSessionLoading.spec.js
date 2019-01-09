import { mount } from "@vue/test-utils"
import TmSessionLoading from "common/TmSessionLoading"

describe(`TmSessionLoading`, () => {
  let wrapper

  beforeEach(() => {
    require(`electron`).ipcRenderer.on = (event, cb) => {
      if (event === `connection-status`) {
        cb(null, `HALLO WORLD`)
      }
    }
    wrapper = mount(TmSessionLoading)
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show connection status`, () => {
    expect(wrapper.html()).toContain(`HALLO WORLD`)
  })
})
