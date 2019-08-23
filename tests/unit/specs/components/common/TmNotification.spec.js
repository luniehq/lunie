import { mount } from "@vue/test-utils"
import TmNotification from "common/TmNotification"

describe(`TmNotification.vue`, () => {
  const notifications = [
    {
      time: Date.now() - 1,
      body: `asdf`
    },
    {
      title: `title`,
      time: Date.now() - 1,
      body: `sadf`
    },
    {
      icon: `search`,
      time: Date.now() - 1,
      body: `sadf`
    },
    {
      type: `warning`,
      time: Date.now() - 1,
      body: `sadf`
    },
    {
      type: `error`,
      time: Date.now() - 1,
      body: `sadf`
    },
    {
      layout: `alert`,
      time: Date.now() - 1,
      body: `sadf`
    }
  ]

  it(`has the expected html structure`, () => {
    notifications.forEach(notification => {
      const wrapper = mount(TmNotification, {
        propsData: { ...notification }
      })
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  it(`closes after a certain timeout automatically`, () => {
    jest.useFakeTimers()
    const wrapper = mount(TmNotification, {
      propsData: {
        time: 44000,
        body: `asdf`
      }
    })
    expect(wrapper.vm.active).toBe(true)
    jest.runAllTimers()
    expect(wrapper.vm.active).toBe(false)
  })

  it(`is hidden if timed out`, () => {
    const wrapper = mount(TmNotification, {
      propsData: {
        time: 100,
        body: `asdf`
      }
    })
    expect(wrapper.vm.active).toBe(false)
  })
})
