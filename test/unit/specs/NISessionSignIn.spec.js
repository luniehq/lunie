import Vuex from 'vuex'
import Vuelidate from 'vuelidate'
import { mount, createLocalVue } from 'vue-test-utils'
import NISessionSignIn from 'common/NiSessionSignIn'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)

describe('NISessionSignIn', () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store()
    wrapper = mount(NISessionSignIn, {
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
      signInSeed: 'bar' // <-- doesn#t check for correctness of seed
    }})
    wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0]).toEqual(['setModalSession', false])
  })

  it('should signal signedin state on successful login', () => {
    wrapper.setData({ fields: {
      signInSeed: 'bar' // <-- doesn#t check for correctness of seed
    }})
    wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[1][0]).toEqual('notify')
    expect(store.commit.mock.calls[1][1].title.toLowerCase()).toContain('welcome back!')
    expect(store.commit.mock.calls[2]).toEqual(['setSignedIn', true])
  })

  it('should show error if not seed specified', () => {
    wrapper.setData({ fields: {
      signInSeed: ''
    }})
    wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find('.ni-form-msg-error')).toBeDefined()
  })
})
