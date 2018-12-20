import Vuex from "vuex"
import { mount, createLocalVue } from "@vue/test-utils"
import NISessionWelcome from "common/TmSessionWelcome"
import LiSession from "common/TmLiSession"

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive(`tooltip`, () => {})
localVue.directive(`focus`, () => {})

describe(`NISessionWelcome`, () => {
  let wrapper, store, getters
  let accounts = []

  beforeEach(() => {
    getters = {
      config: () => ({ devMode: true }),
      lastHeader: () => ({ chain_id: `gaia-test`, height: `31337` }),
      user: () => ({ accounts }),
      connected: () => true,
      nodeURL: () => `http://nodeUrl`,
      mockedConnector: () => false
    }
    store = new Vuex.Store({ getters })
    store.commit = jest.fn()
    store.dispatch = jest.fn(async () => true)
    wrapper = mount(NISessionWelcome, {
      localVue,
      store
    })
  })

  describe(`without accounts`, () => {
    it(`should open the help modal on click`, () => {
      wrapper
        .findAll(`.tm-session-header a`)
        .at(1)
        .trigger(`click`)
      expect(store.commit.mock.calls[0]).toEqual([`setModalHelp`, true])
    })

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
