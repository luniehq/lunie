import { mount, createLocalVue } from "@vue/test-utils"
import { focusElement, focusParentLast } from "src/directives"

let localVue = createLocalVue()
localVue.directive("focus", focusElement)
localVue.directive("focus-last", focusParentLast)

const mountOptions = {
  localVue,
  attachToDocument: true,
}

describe("Focus element", () => {
  let wrapper

  const component = {
    template: `<div tabindex="0" v-focus><input /></div>`,
  }

  it("will focus correct element", () => {
    wrapper = mount(component, mountOptions)
    let focusedElement = wrapper.find("div").element
    expect(focusedElement).toEqual(document.activeElement)
  })

  afterEach(() => {
    wrapper.destroy()
  })
})

describe("Focus Parent Element", () => {
  let wrapper

  const componentInputFocused = {
    template: `<div tabindex="0" v-focus-last><input v-focus/></div>`,
  }

  const componentParentFocused = {
    template: `<div tabindex="0" v-focus-last><input /></div>`,
  }

  it("will not focus parent element", () => {
    wrapper = mount(componentInputFocused, mountOptions)
    let focusedElement = wrapper.find("input").element
    expect(focusedElement).toEqual(document.activeElement)
  })

  it("will focus parent element", () => {
    wrapper = mount(componentParentFocused, mountOptions)
    let focusedElement = wrapper.find("div").element
    expect(focusedElement).toEqual(document.activeElement)
  })

  afterEach(() => {
    wrapper.destroy()
  })
})
