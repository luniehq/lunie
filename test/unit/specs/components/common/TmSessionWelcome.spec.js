import Vuex from "vuex"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmSessionWelcome from "common/TmSessionWelcome"
import LiSession from "common/TmLiSession"

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive(`tooltip`, () => {})
localVue.directive(`focus`, () => {})

describe(`TmSessionWelcome`, () => {
  let wrapper, store, getters
  const accounts = []

  beforeEach(() => {
    getters = {
      config: () => ({ devMode: true }),
      lastHeader: () => ({ chain_id: `gaia-test`, height: `31337` }),
      user: () => ({ accounts }),
      lastPage: () => `/`,
      connected: () => true,
      nodeUrl: () => `http://nodeUrl`
    }
    store = new Vuex.Store({ getters })
    store.commit = jest.fn()
    store.dispatch = jest.fn(async () => true)
    wrapper = shallowMount(TmSessionWelcome, {
      localVue,
      store
    })
  })

  describe(`header buttons`, () => {
    it(`should open the help modal on click`, () => {
      wrapper.vm.help()
      expect(store.commit).toHaveBeenCalledWith(`setModalHelp`, true)
    })

    it(`should close the session modal on click`, () => {
      const $store = { commit: jest.fn() }
      const self = { back: jest.fn(), $store }
      TmSessionWelcome.methods.closeSession.call(self)
      expect($store.commit).toHaveBeenCalledWith(`setModalSession`, false)
      expect($store.commit).toHaveBeenCalledWith(`setModalSessionState`, false)
    })

    it(`goes back to last page`, () => {
      const $store = { commit: jest.fn() }
      const self = {
        $store,
        lastPage: `/`,
        $router: {
          push: jest.fn()
        }
      }
      TmSessionWelcome.methods.back.call(self)
      expect($store.commit).toHaveBeenCalledWith(`pauseHistory`, true)
      expect(self.$router.push).toHaveBeenCalled()
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

  describe(`without accounts`, () => {
    it(`should not show sign-in link since we have no accounts`, () => {
      wrapper.find(LiSession).trigger(`click`)
      expect(store.commit.mock.calls[0][1]).not.toEqual(`sign-in`)
    })

    it(`has the expected html structure`, () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`with accounts`, () => {
    beforeAll(() => {
      accounts.push(`foo`, `bar`)
    })

    it(`should show sign-in link since we have accounts`, () => {
      wrapper.find(LiSession).trigger(`click`)
      expect(store.commit.mock.calls[0][1]).toEqual(`sign-in`)
    })

    it(`sets desired login method`, () => {
      wrapper.findAll(LiSession).trigger(`click`)
      expect(store.commit.mock.calls[0][0]).toBe(`setModalSessionState`)
      expect(store.commit.mock.calls.map(args => args[1])).toEqual([
        `sign-in`,
        `sign-up`,
        `import`,
        `hardware`
      ])
    })

    it(`has the expected html structure`, () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })
})
