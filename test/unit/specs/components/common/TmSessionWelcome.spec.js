import { shallowMount } from "@vue/test-utils"
import TmSessionWelcome from "common/TmSessionWelcome"

describe(`TmSessionWelcome`, () => {
  let wrapper, $store
  const accounts = []

  beforeEach(() => {
    const getters = {
      session: { accounts, experimentalMode: true },
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
    it(`should open the help modal on click`, () => {
      const $store = { commit: jest.fn() }
      const self = { $store }
      TmSessionWelcome.methods.help.call(self)
      expect($store.commit).toHaveBeenCalledWith(`setModalHelp`, true)
    })

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
        expect($store.commit).toHaveBeenCalledWith(`setSessionModalView`, false)
        expect(self.back).not.toHaveBeenCalled()
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
        expect($store.commit).toHaveBeenCalledWith(`setSessionModalView`, false)
        expect(self.back).toHaveBeenCalled()
      })
    })

    describe(`back`, () => {
      it(`goes back to last page`, () => {
        const $store = { commit: jest.fn() }
        const self = {
          $store,
          lastPage: `/`,
          $router: {
            push: jest.fn((_, cb) => {
              cb()
            })
          }
        }
        TmSessionWelcome.methods.back.call(self)
        expect($store.commit).toHaveBeenCalledWith(`pauseHistory`, true)
        expect(self.$router.push).toHaveBeenCalledWith(
          `/`,
          expect.any(Function)
        )
        expect($store.commit).toHaveBeenCalledWith(`popHistory`)
        expect($store.commit).toHaveBeenCalledWith(`pauseHistory`, false)
      })

      it(`doesn't go back if there's no last Page`, () => {
        const $store = { commit: jest.fn() }
        const self = {
          $store,
          lastPage: undefined,
          $router: {
            push: jest.fn()
          }
        }
        TmSessionWelcome.methods.back.call(self)
        expect($store.commit).not.toHaveBeenCalledWith(`pauseHistory`, true)
      })
    })
  })

  describe(`without accounts`, () => {
    it(`should not show sign-in link since we have no accounts`, () => {
      wrapper.vm.setState = jest.fn()
      expect(wrapper.find(`#sign-in-with-account`).exists()).toBe(false)
    })

    it(`has the expected html structure`, () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`with accounts`, () => {
    beforeEach(() => {
      const getters = {
        session: { accounts: [`foo`, `bar`], experimentalMode: true },
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
      wrapper.vm.setState(`xxx`)
      expect($store.commit).toHaveBeenCalledWith(`setSessionModalView`, `xxx`)
    })

    it(`has the expected html structure`, () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`production`, () => {
    it(`should hide sign in with account in production`, () => {
      wrapper.vm.setState = jest.fn()
      expect(wrapper.find(`#sign-in-with-account`).exists()).toBe(false)
    })
  })
})
