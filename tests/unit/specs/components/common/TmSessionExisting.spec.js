import { shallowMount } from "@vue/test-utils"
import TmSessionExisting from "common/TmSessionExisting"

describe(`TmSessionExisting`, () => {
  let wrapper, $store

  beforeEach(() => {
    const state = {
      session: {
        insecureMode: false,
        browserWithLedgerSupport: null
      },
      extension: {
        enabled: true
      },
      keystore: {
        accounts: []
      },
    }
    $store = {
      state,
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

  describe(`default view in production`, () => {
    it(`shows "Explore with any address"`, () => {
      expect(wrapper.find(`#explore-with-address`).exists()).toBe(true)
    })

    it(`shows "Use Ledger Nano"`, () => {
      wrapper.setData({ isMobileApp: false })
      expect(wrapper.find(`#use-ledger-nano`).exists()).toBe(true)
    })

    it(`shows "Use Lunie Browser Extension"`, () => {
      wrapper.setData({ isMobileApp: false })
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

  describe(`mobile app`, () => {
    beforeEach(() => {
      wrapper.setData({ isMobileApp: true })
      wrapper.vm.session.insecureMode = false
    })

    it(`does not show extension or ledger sign-in options`, () => {
      expect(wrapper.find(`#use-extension`).exists()).toBe(false)
      expect(wrapper.find(`#use-ledger-nano`).exists()).toBe(false)
    })
  })
})
