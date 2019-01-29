import setup from "../../../helpers/vuex-setup"
import TmLiCopy from "common/TmLiCopy"

describe(`TmLiCopy`, () => {
  let wrapper
  const { mount } = setup()

  beforeEach(() => {
    const instance = mount(TmLiCopy, {
      propsData: {
        value: `hallo`,
        receive: false
      }
    })
    wrapper = instance.wrapper
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show the provided value`, () => {
    wrapper.setProps({ value: `HALLO` })
    expect(wrapper.html()).toContain(`HALLO`)
  })

  it(`should show the receive button`, () => {
    wrapper.setProps({ value: `HALLO`, receive: true })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
