import { shallowMount } from "@vue/test-utils"
import TmLiSession from "session/TmLiSession"

describe(`TmLiSession`, () => {
  let wrapper
  const propsData = {
    icon: `mood`,
    title: `useful title`,
  }
  beforeEach(() => {
    wrapper = shallowMount(TmLiSession, { propsData, stubs: [`router-link`] })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should have an icon`, () => {
    expect(
      wrapper.find(`.tm-li-session-icon i.material-icons`).html()
    ).toContain(`mood`)
  })

  it(`should have a title`, () => {
    expect(wrapper.find(`.tm-li-session-title`).html()).toContain(
      `useful title`
    )
  })
})
