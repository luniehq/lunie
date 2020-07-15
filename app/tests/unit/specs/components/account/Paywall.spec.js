import { shallowMount } from "@vue/test-utils"
import Paywall from "src/components/account/Paywall"

describe(`Paywall`, () => {
  let wrapper, $store, dispatch

  beforeEach(() => {
    dispatch = jest.fn()
    $store = {
      state: {
        account: {
          userSignedIn: false,
        },
      },
      dispatch,
    }
    wrapper = shallowMount(Paywall, {
      mocks: {
        $store,
      },
    })
  })

  it(`should show the Paywall page`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`handleIntercom should dispatch displayMessenger action`, () => {
    wrapper.vm.handleIntercom()
    expect(dispatch).toHaveBeenCalledWith(`displayMessenger`)
  })
})
