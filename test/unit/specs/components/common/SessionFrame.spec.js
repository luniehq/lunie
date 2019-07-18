import { shallowMount } from "@vue/test-utils"
import SessionFrame from "common/SessionFrame"

describe(`SessionFrame`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(SessionFrame, {
      mocks: {
        $router: {
          go: jest.fn()
        }
      },
      stubs: [`router-link`]
    })
  })

  it(`shows an overview of all wallets to sign in with from the extension`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should go back to Welcome when back arrow is clicked`, () => {
    wrapper.vm.goBack()
    expect(wrapper.vm.$router.go).toHaveBeenCalledWith(`-1`)
  })
})
