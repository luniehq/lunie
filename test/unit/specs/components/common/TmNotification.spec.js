import { mount } from "@vue/test-utils"
import TmNotification from "common/TmNotification"

describe(`TmNotification.vue`, () => {
  const notifications = [
    {
      time: 44000,
      body: `asdf`
    },
    {
      title: `title`,
      time: 44000,
      body: `sadf`
    },
    {
      icon: `search`,
      time: 44000,
      body: `sadf`
    },
    {
      type: `warning`,
      time: 44000,
      body: `sadf`
    },
    {
      type: `error`,
      time: 44000,
      body: `sadf`
    },
    {
      layout: `alert`,
      time: 44000,
      body: `sadf`
    }
  ]

  it(`has the expected html structure`, () => {
    notifications.forEach(notification => {
      let wrapper = mount(TmNotification, {
        propsData: { data: notification }
      })
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  it(`closes after a certain timeout automatically`, () => {
    jest.useFakeTimers()
    let wrapper = mount(TmNotification, {
      propsData: {
        data: {
          time: 44000,
          body: `asdf`
        }
      }
    })
    expect(wrapper.vm.active).toBe(true)
    jest.runAllTimers()
    expect(wrapper.vm.active).toBe(false)
  })
})
