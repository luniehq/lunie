import { shallowMount } from "@vue/test-utils"
import CardSignInRequired from "common/CardSignInRequired"

describe(`CardSignInRequired`, () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallowMount(CardSignInRequired)
  })

  it(`shows a sign in required card`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`opens the session modal`, () => {
    const commit = jest.fn()
    CardSignInRequired.methods.goToSession.call({
      $store: {
        commit
      }
    })

    expect(commit).toHaveBeenCalledWith(`setSessionModalView`, `welcome`)
    expect(commit).toHaveBeenCalledWith(`toggleSessionModal`, true)
  })
})
