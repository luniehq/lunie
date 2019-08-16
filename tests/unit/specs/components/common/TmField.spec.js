import { shallowMount } from "@vue/test-utils"
import TmField from "common/TmField"

describe(`TmField`, () => {
  let wrapper
  beforeEach(async () => {
    wrapper = shallowMount(TmField)
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`emits updates`, () => {
    const wrapper = shallowMount(TmField)
    wrapper.vm.updateValue(`Hallo World`)
    expect(wrapper.emittedByOrder()).toEqual([
      { args: [`Hallo World`], name: `input` }
    ])
  })

  it(`allows for callbacks`, () => {
    const change = jest.fn()
    const keyup = jest.fn()
    const keydown = jest.fn()
    wrapper.setProps({
      change,
      keyup,
      keydown
    })
    wrapper.find(`input`).trigger(`keyup`, {
      key: `1`,
      code: `Digit1`
    })
    wrapper.find(`input`).trigger(`keydown`, {
      key: `2`,
      code: `Digit2`
    })
    wrapper.find(`input`).trigger(`change`, {})
    expect(keyup).toHaveBeenCalledTimes(1)
    expect(keydown).toHaveBeenCalledTimes(1)
    expect(change).toHaveBeenCalledTimes(1)
  })

  it(`shouldn't crash if no callbacks defined`, () => {
    wrapper.find(`input`).trigger(`keyup`, {
      key: `1`,
      code: `Digit1`
    })
    wrapper.find(`input`).trigger(`keydown`, {
      key: `2`,
      code: `Digit2`
    })
    wrapper.find(`input`).trigger(`change`, {})
  })

  it(`displays as a select`, () => {
    const wrapper = shallowMount(TmField, {
      propsData: {
        type: `select`
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
    wrapper.setProps({
      options: [
        {
          key: `1`,
          value: `1`
        },
        {
          key: `2`,
          value: `2`
        }
      ]
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
    wrapper.setProps({
      placeholder: `Select a number...`
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
    const wrapper = shallowMount(TmField, {
      propsData: {
        type: `number`
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`trims number values`, () => {
    const wrapper = shallowMount(TmField, { propsData: { type: `number` } })
    wrapper.vm.updateValue(`42 `)
    expect(wrapper.emittedByOrder()).toEqual([{ args: [`42`], name: `input` }])
  })

  it(`displays a toggle`, () => {
    const wrapper = shallowMount(TmField, {
      propsData: {
        type: `toggle`
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
    // works with default option
    wrapper.setProps({
      value: false,
      options: {
        checked: `cool`,
        unchecked: `bad`
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()

    // triggers
    expect(wrapper.find(`.tm-toggle-wrapper > span`).text()).toBe(`bad`)
    wrapper.find(`.tm-toggle-wrapper`).trigger(`click`)
    expect(wrapper.find(`.tm-toggle-wrapper > span`).text()).toBe(`cool`)
    expect(wrapper.vm.$el).toMatchSnapshot()

    // allows for updates from the outside
    wrapper.setProps({
      value: true
    })
    wrapper.setProps({
      value: false
    })
    expect(wrapper.find(`.tm-toggle-wrapper > span`).text()).toBe(`bad`)
  })

  it(`displays a disabled toggle`, () => {
    const wrapper = shallowMount(TmField, {
      propsData: {
        type: `toggle`,
        isDisabled: true,
        value: false,
        options: {
          checked: `cool`,
          unchecked: `bad`
        }
      }
    })

    expect(wrapper.vm.$el).toMatchSnapshot()

    // disable triggers
    expect(wrapper.find(`.tm-toggle-wrapper > span`).text()).toBe(`bad`)
    wrapper.find(`.tm-toggle-wrapper`).trigger(`click`)
    expect(wrapper.find(`.tm-toggle-wrapper > span`).text()).not.toBe(`cool`)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`allows for style customization`, () => {
    const wrapper = shallowMount(TmField, {
      propsData: {
        size: `lg`
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
