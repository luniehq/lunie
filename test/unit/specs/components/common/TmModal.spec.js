import { shallowMount } from "@vue/test-utils"
import TmModal from "common/TmModal"

describe(`TmModal`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(TmModal, {
      propsData: {
        close: jest.fn()
      }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should use slots`, () => {
    wrapper = shallowMount(TmModal, {
      slots: {
        title: `<div class="hello" />`,
        footer: `<div class="world" />`
      },
      propsData: {
        close: jest.fn()
      }
    })
    expect(wrapper.find(`custom-title`)).toBeDefined()
    expect(wrapper.find(`custom-footer`)).toBeDefined()
  })
})
