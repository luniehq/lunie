import Vuex from 'vuex'
import Vuelidate from 'vuelidate'
import { mount, createLocalVue } from 'vue-test-utils'
import htmlBeautify from 'html-beautify'
import NiSessionSignIn from 'common/NiSessionSignIn'

const user = require('renderer/vuex/modules/user').default({})

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)

describe('NiSessionSignIn', () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        user
      }
    })
    wrapper = mount(NiSessionSignIn, {
      localVue,
      store
    })
    store.commit = jest.fn()
    store.dispatch = jest.fn(async () => null)
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it('should go back to the welcome screen on click', () => {
    wrapper.findAll('.ni-session-header a').at(0).trigger('click')
    expect(store.commit.mock.calls[0][0]).toBe('setModalSessionState')
    expect(store.commit.mock.calls[0][1]).toBe('welcome')
  })

  it('should open the help model on click', () => {
    wrapper.findAll('.ni-session-header a').at(1).trigger('click')
    expect(store.commit.mock.calls[0]).toEqual(['setModalHelp', true])
  })

  it('should close the modal on successful login', async () => {
    wrapper.setData({ fields: {
      signInPassword: '1234567890'
    }})
    await wrapper.vm.onSubmit()
    let calls = store.commit.mock.calls.map(args => args[0])
    expect(calls).toContain('setModalSession')
  })

  it('should signal signedin state on successful login', async () => {
    wrapper.setData({ fields: {
      signInPassword: '1234567890'
    }})
    await wrapper.vm.onSubmit()
    let calls = store.commit.mock.calls.map(args => args[0])
    expect(calls).toContain('notify')
    expect(calls).toContain('signIn')
  })

  it('should show error if password not 10 long', () => {
    wrapper.setData({ fields: {
      signInPassword: '123'
    }})
    wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find('.ni-form-msg-error')).toBeDefined()
  })

  it('should show a notification if signin failed', async () => {
    store.dispatch = jest.fn(() => Promise.reject('Planed rejection'))
    wrapper.setData({ fields: {
      signInPassword: '1234567890'
    }})
    await wrapper.vm.onSubmit()
    expect(store.commit).toHaveBeenCalled()
    expect(store.commit.mock.calls[0][0]).toBe('notifyError')
  })
})
