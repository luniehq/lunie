import Vuex from "vuex"
import Vuelidate from "vuelidate"
import { mount, createLocalVue } from "@vue/test-utils"
import TmSessionHardware from "common/TmSessionHardware"

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)
localVue.directive(`tooltip`, () => {})
localVue.directive(`focus`, () => {})

describe(`TmSessionHardware`, () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        session: { browserWithLedgerSupport: true }
      }
    })

    wrapper = mount(TmSessionHardware, {
      localVue,
      store,
      mocks: {
        router: {
          push: jest.fn()
        }
      },
      stubs: [`router-link`]
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
        dispatch: jest.fn(() => "cosmos1234")
      }
      const $router = {
        push: jest.fn()
      }
      const self = {
        $store,
        $router,
        status: `connect`,
        connectionError: null,
        setStatus: jest.fn(),
        setConnectionError: jest.fn(error => (self.connectionError = error)),
        confirmAddress: jest.fn(() => true)
      }
      await TmSessionHardware.methods.signIn.call(self)
      expect(self.$store.dispatch).toHaveBeenCalledWith(`connectLedgerApp`)
      expect(self.connectionError).toBeNull()
      expect(self.$store.dispatch).toHaveBeenCalledWith(`signIn`, {
        sessionType: `ledger`,
        address: "cosmos1234"
      })
    })

    it(`doesn't sign in if ledger not connected`, async () => {
      const $store = {
        dispatch: jest.fn(async () =>
          Promise.reject(new Error(`No Ledger found`))
        )
      }
      const self = {
        $store,
        status: `connect`,
        connectionError: null,
        setStatus: jest.fn(),
        setConnectionError: jest.fn(error => (self.connectionError = error))
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
          userAgent: "Chrome"
        }
      })

      expect(wrapper.html()).toMatchSnapshot()
      expect(wrapper.html()).toContain(
        "Using a Ledger on Windows requires experimental HID support in your"
      )
    })
  })
})
