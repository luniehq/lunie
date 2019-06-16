import Vuex from "vuex"
import Vuelidate from "vuelidate"
import { mount, createLocalVue } from "@vue/test-utils"
import TmSessionHardware from "common/TmSessionHardware"

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)
localVue.directive(`tooltip`, () => { })
localVue.directive(`focus`, () => { })

describe(`TmSessionHardware`, () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store({
      getters: {
        session: () => ({ browserWithLedgerSupport: true })
      }
    })
    wrapper = mount(TmSessionHardware, {
      localVue,
      store
    })
    store.commit = jest.fn()
  })

  describe(`shows the ledger conection view`, () => {
    it(`with no errors`, () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`when there're errors`, async () => {
      wrapper.vm.connectionError = `No Ledger found`
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  it(`should go back to the welcome screen on click`, () => {
    wrapper
      .findAll(`.session-header a`)
      .at(0)
      .trigger(`click`)
    expect(store.commit.mock.calls[0][0]).toBe(`setSessionModalView`)
    expect(store.commit.mock.calls[0][1]).toBe(`existing`)
  })

  it(`should close the session modal`, () => {
    wrapper
      .findAll(`.session-header a`)
      .at(1)
      .trigger(`click`)
    expect(store.commit.mock.calls[0][0]).toBe(`toggleSessionModal`)
    expect(store.commit.mock.calls[0][1]).toBe(false)
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
      const self = {
        $store,
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

    it(`doesn't sign in if address not confirmed`, async () => {
      const $store = {
        dispatch: jest.fn(() => "cosmos1234")
      }
      const self = {
        $store,
        status: `connect`,
        connectionError: null,
        setStatus: jest.fn(),
        setConnectionError: jest.fn(error => (self.connectionError = error)),
        confirmAddress: jest.fn(() => false)
      }
      await TmSessionHardware.methods.signIn.call(self)
      expect(self.$store.dispatch).not.toHaveBeenCalledWith(
        `signIn`,
        expect.objectContaining({})
      )
      expect(self.status).toBe("connect")
    })
  })

  describe(`confirmAddress`, () => {
    it(`success`, async () => {
      const $store = { dispatch: jest.fn() }
      const self = {
        $store,
        connectionError: null
      }
      const result = await TmSessionHardware.methods.confirmAddress.call(self)
      expect(self.$store.dispatch).toHaveBeenCalledWith(`confirmLedgerAddress`)
      expect(self.connectionError).toBeNull()
      expect(result).toBe(true)
    })

    it(`disapprove`, async () => {
      const $store = {
        dispatch: jest.fn(async () =>
          Promise.reject(new Error(`Displayed address was rejected`))
        )
      }
      const self = {
        $store
      }
      const result = await TmSessionHardware.methods.confirmAddress.call(self)
      expect(self.$store.dispatch).toHaveBeenCalledWith(`confirmLedgerAddress`)
      expect(self.connectionError).toBe(`Displayed address was rejected`)
      expect(result).toBe(false)
    })
  })
})
