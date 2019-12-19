import { shallowMount, createLocalVue } from "@vue/test-utils"
import ModalTutorial from "common/ModalTutorial"
import { focusParentLast } from "src/directives"

let localVue = createLocalVue()
localVue.directive("focus-last", focusParentLast)

describe(`TmModal`, () => {
  let wrapper
  let mockCloseFn

  beforeEach(() => {
    mockCloseFn = jest.fn()
    wrapper = shallowMount(ModalTutorial, {
      localVue,
      propsData: {
        close: mockCloseFn,
        show: true
      }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should close with escape key`, () => {
    wrapper.trigger("keyup.esc")
    expect(mockCloseFn).toBeCalled()
  })
})
