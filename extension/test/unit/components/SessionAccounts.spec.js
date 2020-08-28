import { shallowMount } from '@vue/test-utils'
import SessionAccounts from 'components/SessionAccounts.vue'

jest.mock('config', () => ({
  lunieLink: 'https://app.lunie.io'
}))

describe(`SessionAccounts`, () => {
  let $store, wrapper

  beforeEach(() => {
    const accounts = [
      { name: `accountname1`, address: 'cosmos1' },
      { name: `accountname2`, address: 'cosmos2' },
      { name: `accountname3`, address: 'cosmos3' }
    ]
    const getters = {
      lastPage: `/`
    }
    $store = {
      getters,
      commit: jest.fn(),
      dispatch: jest.fn(),
      state: {
        session: {
          insecureMode: true,
          browserWithLedgerSupport: null
        },
        accounts
      }
    }
    wrapper = shallowMount(SessionAccounts, {
      mocks: {
        $store
      },
      stubs: [`router-link`]
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`has correct go to lunie method`, () => {
    const openFn = jest.fn()
    window.open = openFn
    const account = {
      address: 'testaddress',
      network: 'testnetwork'
    }
    wrapper.vm.goToLunie(account)
    expect(openFn).toHaveBeenCalledWith(
      'https://app.lunie.io/extension/testaddress/testnetwork',
      '_blank',
      'noreferrer noopener'
    )
  })
})
