import { shallowMount } from "@vue/test-utils"
import TmSessionExisting from "common/TmSessionExisting"

describe(`TmSessionExisting`, () => {
  let wrapper, $store

  beforeEach(() => {
    const getters = {
      session: {
        insecureMode: false,
        browserWithLedgerSupport: null
      },
      keystore: {
        accounts: []
      },
      lastPage: `/`
    }
    $store = {
      getters,
      commit: jest.fn(),
      dispatch: jest.fn()
    }
    wrapper = shallowMount(TmSessionExisting, {
      mocks: {
        $store
      },
      stubs: [`router-link`]
    })
  })

  it(`should set the current view to the state`, () => {
    wrapper.vm.setState(`someState`)
    expect($store.commit).toHaveBeenCalledWith(
      `setSessionModalView`,
      `someState`
    )
  })

  it(`should go back to the welcome screen`, () => {
    wrapper.vm.goToWelcome()
    expect($store.commit).toHaveBeenCalledWith(`setSessionModalView`, `welcome`)
  })

  describe(`default view in production`, () => {
    it(`shows "Explore with any address"`, () => {
      expect(wrapper.find(`#explore-with-address`).exists()).toBe(true)
    })

    it(`shows "Use Ledger Nano"`, () => {
      expect(wrapper.find(`#use-ledger-nano`).exists()).toBe(true)
    })
  })

  describe(`insecure mode in production`, () => {
    it(`shows "Recover with backup code"`, () => {
      wrapper.vm.session.insecureMode = true
      expect(wrapper.find(`#recover-with-backup`).exists()).toBe(true)
    })
  })

  describe(`insecure mode with an existing account`, () => {
    it(`shows "Sign in with account"`, () => {
      wrapper.vm.session.insecureMode = true
      wrapper.vm.keystore.accounts = [`account1`]

      expect(wrapper.find(`#sign-in-with-account`).exists()).toBe(true)
    })
  })
})
