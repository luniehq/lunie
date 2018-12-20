import { mount } from "@vue/test-utils"
import TmNotifications from "common/TmNotifications"

describe(`TmNotifications.vue`, () => {
  let wrapper
  beforeEach(async () => {
    const notifications = [
      {
        body: `asdf`
      },
      {
        body: `sadf`
      }
    ]
    wrapper = mount(TmNotifications, {
      propsData: { notifications }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
