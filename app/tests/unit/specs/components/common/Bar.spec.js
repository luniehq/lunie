import { shallowMount } from "@vue/test-utils"
import Bar from "common/Bar"

describe(`Bar`, () => {
  it(`shows a primary bar`, () => {
    let wrapper = shallowMount(Bar, {
      propsData: {
        barType: "primary",
        show: true,
      },
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should close if we click in close link`, () => {
    let wrapper = shallowMount(Bar, {
      propsData: {
        barType: "primary",
        show: true,
      },
    })
    wrapper.vm.close()
    expect(wrapper.text()).toBe("")
  })

  it(`should emit a close event when we click on close link`, () => {
    const self = {
      $emit: jest.fn(),
    }
    Bar.methods.close.call(self)
    expect(self.$emit).toHaveBeenCalledWith("close")
  })

  it(`should navigate to the given link`, () => {
    const self = {
      $router: {
        push: jest.fn(),
      },
    }
    let link = "validators"
    Bar.methods.goToLink.call(self, link)
    expect(self.$router.push).toHaveBeenCalledWith("validators")
    link = "https://lunie.io"
    // eslint-disable-next-line no-global-assign
    window = { open: jest.fn() }
    Bar.methods.goToLink.call(self, link)
    expect(window.open).toHaveBeenCalledWith("https://lunie.io", "_blank")
  })
})
