import Vuex from 'vuex'
import { mount, createLocalVue } from 'vue-test-utils'
import htmlBeautify from 'html-beautify'
import NISessionWelcome from 'common/NiSessionWelcome'
import LiSession from 'common/NiLiSession'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('NISessionWelcome', () => {
  let wrapper, store, getters
  let accounts = []

  beforeEach(() => {
    getters = {
      config: () => ({ devMode: true }),
      user: () => ({ accounts })
    }
    store = new Vuex.Store({ getters })
    store.commit = jest.fn()
    store.dispatch = jest.fn(async () => true)
    wrapper = mount(NISessionWelcome, {
      localVue,
      store
    })
  })

  describe('without accounts', () => {
    it('should open the help model on click', () => {
      wrapper.findAll('.ni-session-header a').at(1).trigger('click')
      expect(store.commit.mock.calls[0]).toEqual(['setModalHelp', true])
    })

    it('should not show sign-in link since we have no accounts', () => {
      wrapper.find(LiSession).trigger('click')
      expect(store.commit.mock.calls[0][1]).not.toEqual('sign-in')
    })

    it('has the expected html structure', () => {
      expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
    })
  })

  describe('with accounts', () => {
    beforeEach(() => {
      wrapper.vm.user.accounts = ['foo', 'bar']
      wrapper.update()
    })

    it('should show sign-in link since we have accounts', () => {
      wrapper.find(LiSession).trigger('click')
      expect(store.commit.mock.calls[0][1]).toEqual('sign-in')
    })

    it('sets desired login method', () => {
      wrapper.findAll(LiSession).trigger('click')
      expect(store.commit.mock.calls[0][0]).toBe('setModalSessionState')
      expect(store.commit.mock.calls.map(args => args[1])).toEqual(['sign-in', 'sign-up', 'restore', 'hardware'])
    })

    it('has the expected html structure', () => {
      expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
    })
  })
})
