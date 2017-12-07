import Vuex from 'vuex'
import { mount, createLocalVue } from 'vue-test-utils'
import htmlBeautify from 'html-beautify'
import NISessionWelcome from 'common/NiSessionWelcome'
import LiSession from 'common/NiLiSession'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('NISessionWelcome', () => {
  let wrapper, store, getters

  beforeEach(() => {
    getters = {
      config: () => ({ devMode: true })
    }
    store = new Vuex.Store({ getters })
    store.commit = jest.fn()
    store.dispatch = jest.fn(async () => true)
    wrapper = mount(NISessionWelcome, {
      localVue,
      store
    })
  })

  it('has the expected html structure', () => {
    wrapper.setData({
      accountExists: false
    })
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it('has the expected html structure if accoutn exists', () => {
    wrapper.setData({
      accountExists: true
    })
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it('should open the help model on click', () => {
    wrapper.findAll('.ni-session-header a').at(1).trigger('click')
    expect(store.commit.mock.calls[0]).toEqual(['setModalHelp', true])
  })

  it('sets desired login method', () => {
    wrapper.setData({
      accountExists: false
    })
    wrapper.findAll(LiSession).trigger('click')
    expect(store.commit.mock.calls[0][0]).toBe('setModalSessionState')
    expect(store.commit.mock.calls.map(args => args[1])).toEqual(['sign-up', 'restore', 'hardware'])
  })

  it('sets desired login method if account exists', () => {
    wrapper.setData({
      accountExists: true
    })
    wrapper.findAll(LiSession).trigger('click')
    expect(store.commit.mock.calls.map(args => args[1])).toEqual(['sign-in', 'delete'])
  })
})
