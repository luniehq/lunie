import { shallowMount } from "@vue/test-utils"
import TmSessionWelcome from "common/TmSessionWelcome"

describe(`TmSessionWelcome`, () => {
  let wrapper, $store
  const accounts = []

  beforeEach(() => {
    const getters = {
      session: {
        accounts,
        insecureMode: true,
        developmentMode: true,
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
      }
    })
  })

  describe(`header buttons`, () => {
    describe(`closes the session modal`, () => {
      it(`without going to prev page`, () => {
        const $store = { commit: jest.fn() }
        const self = {
          back: jest.fn(),
          $store,
          $router: {
            currentRoute: {
              path: `/`
            }
          }
        }
        TmSessionWelcome.methods.closeSession.call(self)
        expect($store.commit).toHaveBeenCalledWith(`toggleSessionModal`, false)
      })

      it(`going back to prev page`, () => {
        const $store = { commit: jest.fn() }
        const self = {
          back: jest.fn(),
          $store,
          $router: {
            currentRoute: {
              path: `/wallet`
            }
          }
        }
        TmSessionWelcome.methods.closeSession.call(self)
        expect($store.commit).toHaveBeenCalledWith(`toggleSessionModal`, false)
      })
    })
  })

  describe(`without accounts`, () => {
    it(`should not show sign-in link since we have no accounts`, () => {
      expect(wrapper.find(`#sign-in-with-account`).exists()).toBe(false)
    })

    it(`has the expected html structure`, () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`with accounts`, () => {
    beforeEach(() => {
      const getters = {
        session: { accounts: [`foo`, `bar`], insecureMode: true },
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
        }
      })
    })

    it(`should show sign-in link since we have accounts`, () => {
      wrapper.vm.setState = jest.fn()
      expect(wrapper.find(`#sign-in-with-account`).exists()).toBe(true)
      wrapper.find(`#sign-in-with-account`).trigger(`click`)
      expect(wrapper.vm.setState).toHaveBeenCalledWith(`sign-in`)
    })

    it(`sets desired login method`, () => {
      Object.defineProperty(window.navigator, `userAgent`, {
        value: `Chrome`,
        writable: true
      })
      wrapper.vm.setState(`xxx`)
      expect($store.commit).toHaveBeenCalledWith(`setSessionModalView`, `xxx`)
    })

    it(`has the expected html structure`, () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`production`, () => {
    it(`should hide sign in with account if users do not opt in`, () => {
      wrapper.vm.session.accounts = [
        {
          name: `test`
        }
      ]
      expect(wrapper.find(`#sign-in-with-account`).exists()).toBe(true)
      wrapper.vm.session.insecureMode = false
      expect(wrapper.find(`#sign-in-with-account`).exists()).toBe(false)
    })

    it(`should hide seed import if not in development`, () => {
      expect(wrapper.find(`#import-seed`).exists()).toBe(true)
      wrapper.vm.session.developmentMode = false
      expect(wrapper.find(`#import-seed`).exists()).toBe(false)
    })
  })
})
