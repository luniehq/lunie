import Vuex from 'vuex'
import { mount, createLocalVue } from 'vue-test-utils'
import Vuelidate from 'vuelidate'
import PageSend from 'renderer/components/wallet/PageSend'

const wallet = require('renderer/vuex/modules/wallet').default({})

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)

describe('PageSend', () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store({
      getters: {
        wallet: () => wallet.state
      },
      modules: {
        wallet
      }
    })
    wrapper = mount(PageSend, {
      localVue,
      store,
      stub: {
        Btn: true,
        Field: true,
        FieldAddon: true,
        FieldGroup: true,
        FormGroup: true,
        FormMsg: true,
        FormStruct: true,
        Page: true,
        Part: true,
        ToolBar: true
      }
    })
    store.commit('setWalletBalances', [{
      denom: 'ATOM',
      amount: 123
    }, {
      denom: 'FERMION',
      amount: 456
    }])

    store.commit = jest.fn()
  })

  it('has the expected html structure', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should populate the select options with denoms', () => {
    expect(wrapper.findAll('option').at(0).text()).toBe('Select token...')
    expect(wrapper.findAll('option').at(1).text()).toBe('ATOM')
    expect(wrapper.findAll('option').at(2).text()).toBe('FERMION')
  })

  xit('should show notification for successful send', () => {
    wrapper.setData({
      fields: {
        denom: 'ATOM',
        address: 'CE456B8BA9AFD1CBDF4ED14558E8C30691E549EA',
        amount: 2
      }
    })
    wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0][0]).toEqual('notify')
  })

  it('should show notification for unsuccessful send', () => {
    wrapper.setData({
      fields: {
        denom: 'ATOM',
        address: 'CE456B8BA9AFD1CBDF4ED14558E8C30691E549EA',
        amount: 2
      }
    })
    wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0][0]).toEqual('notifyError')
  })
})
