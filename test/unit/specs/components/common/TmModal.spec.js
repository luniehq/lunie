import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmModal from "common/TmModal"
import { focusParentLast } from "directives"

let localVue = createLocalVue()
localVue.directive("focus-last", focusParentLast)

describe(`TmModal`, () => {
  let wrapper
  let mockCloseFn

  beforeEach(() => {
    mockCloseFn = jest.fn()
    wrapper = shallowMount(TmModal, {
      localVue,
      propsData: {
        close: mockCloseFn
      }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should use slots`, () => {
    wrapper = shallowMount(TmModal, {
      localVue,
      slots: {
        title: `<div class="hello" />`,
        footer: `<div class="world" />`
      },
      propsData: {
        close: mockCloseFn
      }
    })
    expect(wrapper.find(`custom-title`)).toBeDefined()
    expect(wrapper.find(`custom-footer`)).toBeDefined()
  })

  it(`should close with escape key`, () => {
    wrapper.trigger("keyup.esc")
    expect(mockCloseFn).toBeCalled()
  })
})
