import { shallowMount } from '@vue/test-utils'
import SessionWelcome from 'components/SessionWelcome.vue'

describe(`SessionWelcome`, () => {
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
    wrapper = shallowMount(SessionWelcome, {
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
