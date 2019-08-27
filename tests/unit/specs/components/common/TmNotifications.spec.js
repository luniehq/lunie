import { mount } from "@vue/test-utils"
import TmNotifications from "common/TmNotifications"

describe(`TmNotifications.vue`, () => {
  let wrapper
  beforeEach(async () => {
    const notifications = [
      {
        body: `asdf`,
        time: Date.now() - 1
      },
      {
        body: `sadf`,
        time: Date.now() - 1
      }
    ]
    wrapper = mount(TmNotifications, {
      propsData: { notifications }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
