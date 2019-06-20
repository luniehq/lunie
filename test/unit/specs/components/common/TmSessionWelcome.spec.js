import { shallowMount } from "@vue/test-utils"
import TmSessionWelcome from "common/TmSessionWelcome"

describe(`TmSessionWelcome`, () => {
  let $store, wrapper
  const accounts = []

  beforeEach(() => {
    const getters = {
      session: {
        accounts,
        insecureMode: true,
        browserWithLedgerSupport: null
      },
      lastPage: `/`
    }
    $store = {
      getters,
      commit: jest.fn(),
      dispatch: jest.fn()
    }
    wrapper = shallowMount(TmSessionWelcome, {
      mocks: {
        $store
      },
      stubs: [`router-link`]
    })
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("moves to other session pages", () => {
    const self = {
      $emit: jest.fn()
    }
    TmSessionWelcome.methods.setState.call(self, "welcome")
    expect(self.$emit).toHaveBeenCalledWith("route-change", "welcome")
  })

  describe(`header buttons`, () => {
    describe(`closes the session modal`, () => {
      it(`without going to prev page`, () => {
        const $store = { commit: jest.fn() }
        const self = {
          back: jest.fn(),
          $emit: jest.fn(),
          $store,
          $router: {
            currentRoute: {
              path: `/`
            }
          }
        }
        TmSessionWelcome.methods.closeSession.call(self)
        expect(self.$emit).toHaveBeenCalledWith(`close`)
      })
    })
  })
})
