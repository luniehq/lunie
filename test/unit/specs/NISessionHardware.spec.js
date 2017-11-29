import Vuex from 'vuex'
import Vuelidate from 'vuelidate'
import { mount, createLocalVue } from 'vue-test-utils'
import NISessionHardware from 'common/NISessionHardware'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)

describe('NISessionHardware', () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store()
    wrapper = mount(NISessionHardware, {
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
  
  it('should show a state indicator for different states of the hardware connection', () => {
    wrapper.setData({status: 'connect'})
    wrapper.update()
    expect(wrapper.html()).toMatchSnapshot()

    wrapper.setData({status: 'detect'})
    wrapper.update()
    expect(wrapper.html()).toMatchSnapshot()

    wrapper.setData({status: 'success'})
    wrapper.update()
    expect(wrapper.html()).toMatchSnapshot()
  })

  // TODO -> not yet 100% clear how this will work
})
