import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuelidate from 'vuelidate'
import SessionApprove from 'components/SessionApprove'

describe(`SessionApprove`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)
  localVue.directive('focus', () => {})

  let wrapper, $store

  const signMessage = `{"account_number":"1","chain_id":"testnet","fee":{"amount":[{"amount":"40","denom":"stake"}],"gas":"39953"},"memo":"(Sent via Lunie)","msgs":[{"type":"cosmos-sdk/MsgSend","value":{"amount":[{"amount":"12000000","denom":"stake"}],"from_address":"cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e","to_address":"cosmos1324vt5j3wzx0xsc32mjhkrvy5gn5ef2hrwcg29"}}],"sequence":"0"}`

  beforeEach(() => {
    const getters = {
      signRequest: {
        senderAddress: 'cosmos1234',
        signMessage
      }
    }

    $store = {
      commit: jest.fn(),
      dispatch: jest
        .fn()
        .mockResolvedValueOnce('approved')
        .mockRejectedValueOnce('rejected'),
      getters
    }

    wrapper = shallowMount(SessionApprove, {
      localVue,
      propsData: {
        validators: []
      },
      mocks: {
        $store,
        $router: {
          push: jest.fn()
        }
      }
    })
  })

  it(`shows the approval modal with the transaction and an invoice table`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  describe('approve', () => {
    it('fails if no password', async () => {
      wrapper.vm.close = jest.fn()
      wrapper.vm.password = ''
      wrapper.find('#approve-btn').trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$store.dispatch).not.toHaveBeenCalled()
      expect(wrapper.vm.close).not.toHaveBeenCalled()
    })

    it('approves and closes', async () => {
      wrapper.vm.close = jest.fn()
      wrapper.vm.password = '1234'
      wrapper.find('#approve-btn').trigger('click')
      expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith(
        'approveSignRequest',
        { password: '1234', senderAddress: 'cosmos1234', signMessage }
      )
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/success`)
    })
  })

  it('reject and close window', async () => {
    wrapper.vm.close = jest.fn()
    wrapper.find('#reject-btn').trigger('click')
    const windowSpy = jest.spyOn(window, 'close')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith(
      'rejectSignRequest',
      {
        signMessage,
        senderAddress: 'cosmos1234'
      }
    )
    await wrapper.vm.$nextTick()
    expect(windowSpy).toHaveBeenCalled()
  })
})
