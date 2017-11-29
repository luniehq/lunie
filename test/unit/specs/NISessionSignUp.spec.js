import Vuex from 'vuex'
import Vuelidate from 'vuelidate'
import { mount, createLocalVue } from 'vue-test-utils'
import NISessionSignUp from 'common/NISessionSignUp'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)

describe('NISessionSignUp', () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store()
    wrapper = mount(NISessionSignUp, {
      localVue,
      store
    })
    store.commit = jest.fn()
  })

  it('has the expected html structure', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should go back to the welcome screen on click', () => {
    wrapper.findAll('.ni-session-header a').at(0).trigger('click')
    expect(store.commit.mock.calls[0][0]).toBe('setModalSessionState')
    expect(store.commit.mock.calls[0][1]).toBe('welcome')
  })
  
  it('should close the modal on successful login', () => {
    wrapper.setData({ fields: {
      signInSeed: 'bar', // <-- doesn#t check for correctness of seed
      signUpWarning: true,
      signUpBackup: true
    }})
    wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0]).toEqual(['setModalSession', false])
  })
  
  it('should signal signedin state on successful login', () => {
    wrapper.setData({ fields: {
      signInSeed: 'bar', // <-- doesn#t check for correctness of seed
      signUpWarning: true,
      signUpBackup: true
    }})
    wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[1][0]).toEqual('notify')
    expect(store.commit.mock.calls[1][1].title.toLowerCase()).toContain('signed up')
    expect(store.commit.mock.calls[2]).toEqual(['setSignedIn', true])
  })
  
  it('should show error if warnings not acknowledged', () => {
    wrapper.setData({ fields: {
      signInSeed: 'bar',
      signUpWarning: false,
      signUpBackup: true
    }})
    wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find('.ni-form-msg-error')).toBeDefined()
  })
  
  it('should show error if backup info not acknowledged', () => {
    wrapper.setData({ fields: {
      signInSeed: 'bar',
      signUpWarning: true,
      signUpBackup: false
    }})
    wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find('.ni-form-msg-error')).toBeDefined()
  })
})
