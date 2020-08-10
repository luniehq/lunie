import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuelidate from 'vuelidate'
import SessionApprove from 'components/SessionApprove'

describe(`SessionApprove`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)
  localVue.directive('focus', () => {})

  let wrapper, $store

  beforeEach(() => {
    const getters = {
      signRequest: {
        senderAddress: 'cosmos1234',
        messageType: 'SendTx',
        message: {
          amount: {
            amount: 12,
            denom: 'STAKE'
          },
          to: ['cosmos1324vt5j3wzx0xsc32mjhkrvy5gn5ef2hrwcg29']
        },
        transactionData: {
          fee: [
            {
              amount: 1e-6,
              denom: 'ustake'
            }
          ],
          gasEstimate: 20000
        },
        network: 'cosmos-hub-testnet'
      },
      networks: [
        {
          id: 'cosmos-hub-testnet',
          network_type: 'cosmos',
          coinLookup: [
            {
              chainDenom: 'ustake',
              viewDenom: 'STAKE',
              chainToViewConversionFactor: 1e-6
            }
          ]
        }
      ]
    }

    $store = {
      commit: jest.fn(),
      dispatch: jest
        .fn()
        .mockResolvedValueOnce('approved')
        .mockRejectedValueOnce('rejected'),
      getters,
      state: {
        accounts: [
          {
            address: 'cosmos1234',
            HDPath: "m/44'/118'/0'/0/0",
            curve: 'ed25519'
          }
        ]
      }
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
        {
          password: '1234',
          ...$store.getters.signRequest,
          HDPath: "m/44'/118'/0'/0/0",
          curve: "ed25519",
        }
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
        ...$store.getters.signRequest
      }
    )
    await wrapper.vm.$nextTick()
    expect(windowSpy).toHaveBeenCalled()
  })
})
