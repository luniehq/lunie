import { shallowMount } from "@vue/test-utils"
import CardSignInRequired from "common/CardSignInRequired"

describe(`CardSignInRequired`, () => {
  let wrapper, $store

  beforeEach(() => {
    const state = {
      session: {
        insecureMode: false,
        browserWithLedgerSupport: null,
      },
      extension: {
        enabled: true,
      },
      keystore: {
        accounts: [],
      },
    }
    $store = {
      state,
      commit: jest.fn(),
      dispatch: jest.fn(() => Promise.resolve()),
      getters: {
        currentNetwork: { id: `polka-mon`, network_type: `polkadot` },
      },
    }
    wrapper = shallowMount(CardSignInRequired, {
      mocks: {
        $store,
      },
      stubs: [`router-link`],
    })
  })

  it(`shows a sign in required card`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
