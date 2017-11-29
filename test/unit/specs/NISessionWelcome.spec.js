import Vuex from 'vuex'
import { mount, createLocalVue } from 'vue-test-utils'
import NISessionWelcome from 'common/NiSessionWelcome'
import NIListItem from 'common/NiListItem'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('NISessionWelcome', () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store()
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
    wrapper.findAll(NIListItem).trigger('click')
    expect(store.commit.mock.calls[0][0]).toBe('setModalSessionState')
    expect(store.commit.mock.calls.map(args => args[1])).toEqual(['sign-up', 'sign-in', 'hardware'])
  })
})
