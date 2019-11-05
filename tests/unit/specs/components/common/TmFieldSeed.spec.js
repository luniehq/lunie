import { mount } from "@vue/test-utils"
import TmFieldSeed from "common/TmFieldSeed"

describe(`TmFieldSeed`, () => {
  let wrapper

  const propsData = {
    value: `one two three four five six seven eight nine ten eleven twelve`
  }

  beforeEach(() => {
    wrapper = mount(TmFieldSeed, { propsData })
  })

  it(`has a value from props`, () => {
    expect(wrapper.vm.value).toContain(
      `one two three four five six seven eight nine ten eleven twelve`
    )
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`has the correct class`, () => {
    expect(wrapper.find(`.tm-field`).classes()).toContain(`tm-field-seed`)
  })

  it(`emits input event on update method call`, () => {
    wrapper.vm.update(`test event`)
    expect(wrapper.emitted().input[0][0]).toEqual(`test event`)
  })

  it(`does not emit input event when update method not called`, () => {
    expect(wrapper.emitted()).toEqual({})
  })
  it(`does not call autosize.update when value does not change`, async () => {
    const autosize = require(`autosize`)
    const spy = jest.spyOn(autosize, `update`)
    expect(spy.mock.calls).toEqual([])
  })
  it(`calls autosize.update when value changes`, async () => {
    const autosize = require(`autosize`)
    const spy = jest.spyOn(autosize, `update`)
    wrapper.setProps({ value: `change value` })
    await wrapper.vm.$nextTick()
    expect(spy).toBeCalled()
    expect(spy.mock.calls[0].length).toEqual(1)
  })
})
