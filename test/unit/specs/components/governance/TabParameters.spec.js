import Vuelidate from "vuelidate"
import setup from "../../../helpers/vuex-setup"
import TabParameters from "src/components/governance/TabParameters"
import lcdClientMock from "src/connectors/lcdClientMock.js"

const { governanceParameters, stakingParameters } = lcdClientMock.state

describe(`TabParameters`, () => {
  let wrapper, store
  const { mount, localVue } = setup()
  localVue.use(Vuelidate)
  localVue.directive(`tooltip`, () => { })
  localVue.directive(`focus`, () => { })

  const $store = {
    commit: jest.fn(),
    dispatch: jest.fn(),
    getters: {
      governanceParameters,
      totalAtoms: 1000000000,
      session: { atoms: 42 }
    }
  }

  beforeEach(() => {
    const instance = mount(TabParameters, {
      localVue,
      doBefore: ({ store }) => {
        store.commit(`setGovParameters`, governanceParameters)
        store.commit(`setStakingParameters`, stakingParameters.parameters)
      },
      $store
    })
    wrapper = instance.wrapper
    store = instance.store
    store.commit(`setConnected`, true)
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows the governance parameters`, () => {
    expect(store.state.governanceParameters.parameters).toEqual(
      governanceParameters
    )
  })

  it(`displays the minimum deposit`, () => {
    expect(wrapper.vm.minimumDeposit).toEqual(`100.000000 STAKEs`)
  })

  it(`displays deposit period in days`, () => {
    expect(wrapper.vm.depositPeriodInDays).toEqual(1)
  })

  it(`displays voting period in days`, () => {
    expect(wrapper.vm.votingPeriodInDays).toEqual(1)
  })
})
