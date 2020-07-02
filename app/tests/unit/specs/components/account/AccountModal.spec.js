import { shallowMount, createLocalVue } from "@vue/test-utils"
import AccountModal from "src/components/account/AccountModal"
import { focusParentLast } from "src/directives"

const localVue = createLocalVue()
localVue.directive("focus-last", focusParentLast)

describe(`AccountModal`, () => {
  let wrapper, $store

  beforeEach(() => {
    $store = {
      getters: {
        networkSlug: `cosmos`,
      },
    }
    wrapper = shallowMount(AccountModal, {
      localVue,
      mocks: {
        $store,
        $router: {
          push: jest.fn(),
        },
      },
    })
  })

  it(`should show the AccountModal page`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
