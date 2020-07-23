import { shallowMount, createLocalVue } from "@vue/test-utils"
import SessionFrame from "common/SessionFrame"
import { focusParentLast } from "src/directives"

let localVue = createLocalVue()
localVue.directive("focus-last", focusParentLast)

describe(`SessionFrame`, () => {
  let wrapper

  const getters = {
    networkSlug: "cosmos-hub",
  }

  beforeEach(() => {
    wrapper = shallowMount(SessionFrame, {
      localVue,
      mocks: {
        $store: { getters },
        $router: {
          go: jest.fn(),
          push: jest.fn(),
        },
        $route: {
          meta: {
            requiresAuth: true,
          },
        },
      },
      stubs: [`router-link`],
    })
  })

  it(`shows an overview of all wallets to sign in with from the extension`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should go back to Welcome when back arrow is clicked`, () => {
    wrapper.vm.goBack()
    expect(wrapper.vm.$router.go).toHaveBeenCalledWith(`-1`)
  })

  it(`should go to validators page of the current network`, () => {
    wrapper.vm.closeModal()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
      name: "validators",
      params: {
        networkId: `cosmos-hub`,
      },
    })
  })
})
