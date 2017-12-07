import Vuex from 'vuex'
import { mount, createLocalVue } from 'vue-test-utils'
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
    wrapper = mount(NISessionWelcome, {
      localVue,
      store
    })
    store.commit = jest.fn()
  })

  it('has the expected html structure', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('sets desired login method', () => {
    wrapper.findAll(LiSession).trigger('click')
    expect(store.commit.mock.calls[0][0]).toBe('setModalSessionState')
    expect(store.commit.mock.calls.map(args => args[1])).toEqual(['sign-in', 'hardware', 'sign-up', 'restore'])
  })
})
