import { shallowMount } from "@vue/test-utils"
import Bar from "common/Bar"

describe(`Bar`, () => {
  it(`shows a primary bar`, () => {
    let wrapper = shallowMount(Bar, {
      propsData: {
        type: "primary",
        show: true
      }
    })
    console.log(wrapper.html())
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should close if we click in close link`, () => {
    let wrapper = shallowMount(Bar, {
      propsData: {
        type: "primary",
        show: true
      }
    })
    wrapper.vm.close()
    console.log(wrapper.html())
    //expect(wrapper.text()).toBe("danger test message")
  })
})
