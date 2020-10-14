import Vuex from "vuex"
import Vuelidate from "vuelidate"
import { mount, createLocalVue } from "@vue/test-utils"
import TmSessionHardware from "session/TmSessionHardware"
import { focusParentLast } from "src/directives"

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)
localVue.directive(`tooltip`, () => {})
localVue.directive(`focus`, () => {})
localVue.directive("focus-last", focusParentLast)
localVue.directive("clipboard", () => {})

jest.mock("scripts/ledger", () => ({
  getAddressFromLedger: () => "cosmos1234",
}))

describe(`TmSessionHardware`, () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        session: { browserWithLedgerSupport: true },
      },
    })

    wrapper = mount(TmSessionHardware, {
      localVue,
      store,
      mocks: {
        router: {
          push: jest.fn(),
        },
      },
      stubs: [`router-link`],
    })
    store.commit = jest.fn()
  })

  describe(`shows the ledger conection view`, () => {
    it(`with no errors`, () => {
      expect(wrapper.element).toMatchSnapshot()
    })

    it(`when there're errors`, async () => {
      wrapper.vm.connectionError = `No Ledger found`
      await wrapper.vm.$nextTick()
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  it(`should show a state indicator for different states of the hardware connection`, () => {
    wrapper.setData({ status: `connect` })
    expect(wrapper.html()).toMatchSnapshot()

    wrapper.setData({ status: `detect` })
    expect(wrapper.html()).toMatchSnapshot()

    wrapper.setData({ status: `confirmAddress` })
    expect(wrapper.html()).toMatchSnapshot()
  })

  describe(`sign in`, () => {
    it(`signs in if Ledger is connected and app is open and address is confirmed`, async () => {
      const $store = {
        dispatch: jest.fn(() => "cosmos1234"),
      }
      const $router = {
        push: jest.fn(),
      }
      const self = {
        $store,
        $router,
        status: `connect`,
        connectionError: null,
        setStatus: jest.fn(),
        setConnectionError: jest.fn((error) => (self.connectionError = error)),
        confirmAddress: jest.fn(() => true),
      }
      await TmSessionHardware.methods.signIn.call(self)
      expect(self.connectionError).toBeNull()
      expect(self.$store.dispatch).toHaveBeenCalledWith(`signIn`, {
        sessionType: `ledger`,
        address: "cosmos1234",
      })
    })

    it(`doesn't sign in if ledger not connected`, async () => {
      jest.resetModules()
      jest.doMock("scripts/ledger", () => ({
        getAddressFromLedger: () =>
          Promise.reject(new Error(`No Ledger found`)),
      }))
      const TmSessionHardware = require("session/TmSessionHardware").default

      const $store = {
        dispatch: jest.fn(() => "cosmos1234"),
      }

      const self = {
        $store,
        status: `connect`,
        connectionError: null,
        setStatus: jest.fn(),
        setConnectionError: jest.fn((error) => (self.connectionError = error)),
      }
      await TmSessionHardware.methods.signIn.call(self)
      expect(self.connectionError).toBe(`No Ledger found`)
      expect(self.$store.dispatch).not.toHaveBeenCalledWith(
        `signIn`,
        expect.objectContaining({})
      )
    })

    it(`does show the instructions to enable HID on Windows`, () => {
      wrapper.setData({
        navigator: {
          hid: undefined,
          platform: "Win64",
          userAgent: "Chrome",
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
      expect(wrapper.html()).toContain(
        "Due to recent Ledger updates, using a Ledger on Windows"
      )
    })

    it(`does show the instructions to fix connection issues for Linux users`, () => {
      wrapper.setData({
        navigator: {
          platform: "Linux i686",
          userAgent: "Chrome",
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
      expect(wrapper.html()).toContain(
        "Since we switched to WebUSB Linux users may experience connection"
      )
    })

    describe(`onCopy`, () => {
      it(`should set and reset copySuccess`, () => {
        jest.useFakeTimers()
        wrapper.vm.onCopy() // old test style to make timer work
        expect(wrapper.vm.copySuccess).toBe(true)

        jest.runAllTimers()
        expect(wrapper.vm.copySuccess).toBe(false)
      })
    })
  })
})
