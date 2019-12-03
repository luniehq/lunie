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
      methods: {
        watchWindowSize: () => {} // overwriting to not cause side effects when setting the data in tests
      },
      stubs: [`router-link`]
    })
  })

  it(`shows an overview of all wallets to sign in with from the extension`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should go back to Welcome when back arrow is clicked`, () => {
    wrapper.vm.goBack()
    expect(wrapper.vm.$router.go).toHaveBeenCalledWith(`-1`)
  })

  it(`shows a material icon to close if windows width drops below 1024px`, () => {
    wrapper.setData({
      desktop: false,
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
