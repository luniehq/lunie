import Vuex from 'vuex'
import Vuelidate from 'vuelidate'
import { mount, createLocalVue } from 'vue-test-utils'
import htmlBeautify from 'html-beautify'
import NiSessionRestore from 'common/NiSessionRestore'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)

describe('NiSessionRestore', () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store()
    wrapper = mount(NiSessionRestore, {
      localVue,
      store
    })
    store.commit = jest.fn()
    store.dispatch = jest.fn(async () => true)
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
      signInPassword: '1234567890',
      restoreSeed: 'bar' // <-- doesn#t check for correctness of seed
    }})
    await wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0]).toEqual(['setModalSession', false])
  })

  it('should signal signed in state on successful login', async () => {
    wrapper.setData({ fields: {
      signInPassword: '1234567890',
      restoreSeed: 'bar' // <-- doesn#t check for correctness of seed
    }})
    await wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[1][0]).toEqual('notify')
    expect(store.commit.mock.calls[1][1].title.toLowerCase()).toContain('welcome back!')
    expect(store.commit).toHaveBeenCalledWith('signIn', {password: '1234567890'})
  })

  it('should show error if seed is not filled in', async () => {
    wrapper.setData({ fields: {
      restoreSeed: ''
    }})
    await wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find('.ni-form-msg-error')).toBeDefined()
  })

  it('should not continue if creation failed', async () => {
    store.dispatch = jest.fn(() => Promise.resolve(null))
    wrapper.setData({ fields: {
      signInPassword: '1234567890',
      restoreSeed: 'bar' // <-- doesn#t check for correctness of seed
    }})
    await wrapper.vm.onSubmit()
    expect(store.commit).not.toHaveBeenCalled()
  })
})
