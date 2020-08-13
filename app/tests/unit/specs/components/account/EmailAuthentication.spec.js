import { shallowMount } from "@vue/test-utils"
import EmailAuthentication from "src/components/account/EmailAuthentication"

describe(`EmailAuthentication`, () => {
  let wrapper, $store

  beforeEach(() => {
    $store = {
      state: {
        account: {
          userSignedIn: true,
        },
      },
      dispatch: jest.fn(),
    }
    wrapper = shallowMount(EmailAuthentication, {
      mocks: {
        $store,
      },
      stubs: [`router-link`],
    })
  })

  it(`should show the EmailAuthentication page`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
