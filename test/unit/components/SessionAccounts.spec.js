import { shallowMount } from '@vue/test-utils'
import SessionAccounts from '../../../src/components/SessionAccounts.vue'

describe(`SessionAccounts`, () => {
  let $store, wrapper

  beforeEach(() => {
    const accounts = [
      { name: `accountname1`, address: 'cosmos1' },
      { name: `accountname2`, address: 'cosmos2' },
      { name: `accountname3`, address: 'cosmos3' }
    ]
    const getters = {
      session: {
        insecureMode: true,
        browserWithLedgerSupport: null
      },
      lastPage: `/`
    }
    $store = {
      getters,
      commit: jest.fn(),
      dispatch: jest.fn(),
      state: {
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
})
