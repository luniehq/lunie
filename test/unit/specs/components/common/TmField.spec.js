import { shallowMount, mount } from "@vue/test-utils"
import TmField from "common/TmField"

describe(`TmField`, () => {
  let wrapper
  beforeEach(async () => {
    wrapper = shallowMount(TmField)
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`trims number values`, () => {
    const wrapper = shallowMount(TmField, { propsData: { type: `number` } })
    wrapper.vm.updateValue(`42 `)
    expect(wrapper.emittedByOrder()).toEqual([{ args: [42], name: `input` }])
  })

  it(`displays as a select`, () => {
    const wrapper = shallowMount(TmField, {
      propsData: {
        type: `select`,
        options: [
          {
            key: `1`,
            value: `1`
          },
          {
            key: `1`,
            value: `1`
          }
        ]
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`displays a textarea`, () => {
    const wrapper = shallowMount(TmField, {
      propsData: {
        type: `textarea`
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`displays a number input`, async () => {
    const wrapper = mount(TmField, {
      propsData: {
        type: `number`
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
    await wrapper.vm.$nextTick()
  })

  // I HAVE NO IDEA HOW THIS IS MODELED
  it(`displays a toggle`, () => {
    const wrapper = shallowMount(TmField, {
      propsData: {
        type: `toggle`,
        options: {
          checked: `on`,
          unchecked: `on`
        }
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
    wrapper.setProps({
      checked: `off`,
      unchecked: `off`
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
