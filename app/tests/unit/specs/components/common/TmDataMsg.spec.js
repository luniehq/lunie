import { mount } from "@vue/test-utils"
import TmDataMsg from "common/TmDataMsg"

describe(`TmDataMsg`, () => {
  let wrapper

  const propsData = {
    title: `sOmEtHiNg Is HaPpEnIng!!!`,
    subtitle: `Oh my! What could it be?`,
    icon: `help`,
    spin: false,
  }

  beforeEach(() => {
    wrapper = mount(TmDataMsg, { propsData })
  })

  it(`has a title from props`, () => {
    expect(wrapper.vm.title).toBe(`sOmEtHiNg Is HaPpEnIng!!!`)
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`has an icon`, () => {
    expect(wrapper.find(`.tm-data-msg__icon i.material-icons`).text()).toBe(
      `help`
    )
  })

  it(`has shows a spinner`, () => {
    wrapper.setProps({ spin: true })
    expect(wrapper.contains(`.fa-spin`)).toBe(true)
  })

  it(`doesn't have a spinning icon`, () => {
    expect(
      wrapper.find(`.tm-data-msg__icon`).contains(`i.material-icons.fa-spin`)
    ).toBe(false)
  })

  it(`has a subtitle`, () => {
    expect(wrapper.find(`.tm-data-msg__subtitle`).text()).toBe(
      `Oh my! What could it be?`
    )
  })
})
