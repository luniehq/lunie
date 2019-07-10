import { shallowMount } from '@vue/test-utils'
import SessionAccounts from '../../../src/components/SessionAccounts.vue'

xdescribe(`SessionAccounts`, () => {
  let $store, wrapper

  beforeEach(() => {
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
      dispatch: jest.fn()
    }
    wrapper = shallowMount(SessionAccounts, {
      mocks: {
        $store
      },
      stubs: [`router-link`]
    })
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
