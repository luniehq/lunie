import Vuex from 'vuex'
import Vuelidate from 'vuelidate'
import { mount, createLocalVue } from 'vue-test-utils'
import htmlBeautify from 'html-beautify'
import NiSessionAccountDelete from 'common/NiSessionAccountDelete'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)

describe('NiSessionAccountDelete', () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store()
    wrapper = mount(NiSessionAccountDelete, {
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
    expect(store.commit.mock.calls[0]).toEqual(['setModalSessionState', 'welcome'])
  })
  
  it('should open the help model on click', () => {
    wrapper.findAll('.ni-session-header a').at(1).trigger('click')
    expect(store.commit.mock.calls[0]).toEqual(['setModalHelp', true])
  })
  
  it('should go back on successful deletion', async () => {
    wrapper.setData({ fields: {
      deletionPassword: '1234567890',
      deletionWarning: true
    }})
    await wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0]).toEqual(['setModalSessionState', 'welcome'])
  })
  
  it('should show error if password not 10 long', async () => {
    wrapper.setData({ fields: {
      deletionPassword: '123',
      deletionWarning: true
    }})
    await wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find('.ni-form-msg-error')).toBeDefined()
  })
  
  it('should show error if deletionWarning is not acknowledged', async () => {
    wrapper.setData({ fields: {
      deletionPassword: '1234567890',
      deletionWarning: false
    }})
    await wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find('.ni-form-msg-error')).toBeDefined()
  })

  it('should show a notification if deletion failed', async () => {
    store.dispatch = jest.fn(() => Promise.reject('Planed rejection'))
    wrapper.setData({ fields: {
      deletionPassword: '1234567890',
      deletionWarning: true
    }})
    await wrapper.vm.onSubmit()
    expect(store.commit).toHaveBeenCalled()
    expect(store.commit.mock.calls[0][0]).toBe('notifyError')
  })
})
