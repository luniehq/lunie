import setup from "../../../helpers/vuex-setup"
import Vuelidate from "vuelidate"
import PageGovernance from "src/components/governance/PageGovernance"
import ModalPropose from "src/ActionModal/components/ModalPropose"
import lcdClientMock from "src/connectors/lcdClientMock.js"

const { governanceParameters, stakingParameters } = lcdClientMock.state

// TODO: refactor according to new unit test standard
describe(`PageGovernance`, () => {
  let wrapper, store
  const { mount, localVue } = setup()
  localVue.use(Vuelidate)
  localVue.directive(`tooltip`, () => {})
  localVue.directive(`focus`, () => {})
  localVue.directive(`clipboard`, () => {})

  beforeEach(() => {
    const instance = mount(PageGovernance, {
      doBefore: ({ store }) => {
        store.commit(`setGovParameters`, governanceParameters)
        store.state.governanceParameters.loaded = true
        store.commit(`setStakingParameters`, stakingParameters.parameters)
        store.commit(`setConnected`, true)
        store.commit(`setSignIn`, true)
      },
      stubs: {
        "tm-balance": true
      }
    })
    wrapper = instance.wrapper
    store = instance.store
    store.state.session.address = lcdClientMock.addresses[0]
    store.dispatch(`updateDelegates`)

    wrapper.vm.$refs.modalPropose = { open: () => {} }
  })

  it(`has the expected html structure`, async () => {
    // somehow we need to wait one tick for the total atoms to update
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`disables proposal creation if not connected`, async () => {
    expect(
      wrapper.vm.$el.querySelector(`#propose-btn`).getAttribute(`disabled`)
    ).toBeNull()
    store.commit(`setConnected`, false)
    expect(
      wrapper.vm.$el.querySelector(`#propose-btn`).getAttribute(`disabled`)
    ).not.toBeNull()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  describe(`Modal onPropose`, () => {
    it(`displays the Propose modal on click`, () => {
      const proposeBtn = wrapper.find(`#propose-btn`)
      proposeBtn.trigger(`click`)
      expect(wrapper.contains(ModalPropose)).toEqual(true)
    })
  })
})
