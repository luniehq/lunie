import { mount } from "@vue/test-utils"
import TmHardwareState from "common/TmHardwareState"

describe(`TmHardwareState`, () => {
  let wrapper

  const propsData = {
    icon: `rotate_right`,
    loading: true
  }

  beforeEach(() => {
    wrapper = mount(TmHardwareState, {
      propsData,
      slots: {
        default: `Detecting your Ledger Wallet`
      }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`has a label`, () => {
    expect(
      wrapper
        .find(`.tm-hardware-state__label`)
        .text()
        .trim()
    ).toContain(`Detecting your Ledger Wallet`)
  })
})
