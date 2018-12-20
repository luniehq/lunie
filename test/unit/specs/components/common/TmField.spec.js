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

  it(`trims number values`, () => {
    const wrapper = shallowMount(TmField, { propsData: { type: `number` } })
    wrapper.vm.updateValue(`42 `)
    expect(wrapper.emittedByOrder()).toEqual([{ args: [42], name: `input` }])
  })
})
