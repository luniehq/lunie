import { shallowMount } from '@vue/test-utils'
import SessionWelcome from '../../../src/components/SessionWelcome.vue'

xdescribe(`SessionWelcome`, () => {
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
    wrapper = shallowMount(SessionWelcome, {
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
