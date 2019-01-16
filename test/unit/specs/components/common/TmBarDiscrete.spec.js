import TmBarDiscrete from "common/TmBarDiscrete"
import { shallowMount } from "@vue/test-utils"

describe(`TmBarDiscrete`, () => {
  let wrapper, clickSpy
  beforeEach(async () => {
    let nodes = [{}, {}]
    clickSpy = jest.fn()
    wrapper = shallowMount(TmBarDiscrete, {
      propsData: { nodes, active: 1, "click-fn": clickSpy }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should mark the active node`, () => {
    expect(
      wrapper
        .findAll(`.tm-bar-discrete__node`)
        .at(1)
        .classes()
    ).toContain(`tm-bar-discrete__node--active`)
  })

  it(`clicking on a node should trigger a callback`, () => {
    wrapper
      .findAll(`.tm-bar-discrete__node`)
      .at(1)
      .trigger(`click`)
    expect(clickSpy).toHaveBeenCalledWith(1)
  })
})
