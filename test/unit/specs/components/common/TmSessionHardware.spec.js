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
    store = new Vuex.Store()
    wrapper = mount(TmSessionHardware, {
      localVue,
      store
    })
    store.commit = jest.fn()
  })

  describe(`has the expected html structure`, () => {
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
      .findAll(`.tm-session-header a`)
      .at(0)
      .trigger(`click`)
    expect(store.commit.mock.calls[0][0]).toBe(`setSessionModalView`)
    expect(store.commit.mock.calls[0][1]).toBe(`welcome`)
  })

  it(`should close the session modal`, () => {
    wrapper
      .findAll(`.tm-session-header a`)
      .at(1)
      .trigger(`click`)
    expect(store.commit.mock.calls[0][0]).toBe(`toggleSessionModal`)
    expect(store.commit.mock.calls[0][1]).toBe(false)
  })

  it(`sets the step status`, () => {
    const self = { step: `connect` }
    TmSessionHardware.methods.setStatus.call(self, `detect`)
    expect(self.status).toBe(`detect`)
  })

  it(`sets a connection error`, () => {
    const self = { connectionError: null }
    TmSessionHardware.methods.setConnectionError.call(self, `No Ledger found`)
    expect(self.connectionError).toBe(`No Ledger found`)
  })

  it(`should show a state indicator for different states of the hardware connection`, () => {
    wrapper.setData({ status: `connect` })
    expect(wrapper.html()).toMatchSnapshot()

    wrapper.setData({ status: `detect` })
    expect(wrapper.html()).toMatchSnapshot()
  })

  describe(`tries connecting to Ledger`, () => {
    it(`connects if Ledger is connected and app is open `, async () => {
      const $store = { commit: jest.fn(), dispatch: jest.fn() }
      const self = {
        $store,
        status: `connect`,
        connectionError: null,
        setStatus: jest.fn(),
        setConnectionError: jest.fn(error => (self.connectionError = error))
      }
      await TmSessionHardware.methods.connectLedger.call(self)
      expect(self.$store.dispatch).toHaveBeenCalledWith(`connectLedgerApp`)
      expect(self.connectionError).toBeNull()
    })

    it(`doesn't connect otherwise`, async () => {
      const $store = {
        commit: jest.fn(),
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
      await TmSessionHardware.methods.connectLedger.call(self)
      expect(self.$store.dispatch).toHaveBeenCalledWith(`connectLedgerApp`)
      expect(self.connectionError).toBe(`No Ledger found`)
    })
  })
})
