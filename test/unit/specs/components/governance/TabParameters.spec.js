import Vuelidate from "vuelidate"
import setup from "../../../helpers/vuex-setup"
import htmlBeautify from "html-beautify"
import TabParameters from "renderer/components/governance/TabParameters"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

let { governanceParameters } = lcdClientMock.state

describe(`TabParameters`, () => {
  let wrapper, store
  let { mount, localVue } = setup()
  localVue.use(Vuelidate)

  const $store = {
    commit: jest.fn(),
    dispatch: jest.fn(),
    getters: {
      governanceParameters,
      totalAtoms: 100,
      user: { atoms: 42 }
    }
  }

  beforeEach(() => {
    let instance = mount(TabParameters, {
      localVue,
      doBefore: ({ store }) => {
        store.commit(`setGovParameters`, governanceParameters)
      },
      $store
    })
    wrapper = instance.wrapper
    store = instance.store
    console.log(store.state.governanceParameters.parameters)
    store.commit(`setConnected`, true)
    wrapper.update()
  })

  it(`has the expected html structure`, async () => {
    await wrapper.vm.$nextTick()
    wrapper.update()
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it(`shows the governance parameters`, () => {
    console.log(store.state.governanceParameters.parameters)
    expect(store.state.governanceParameters.parameters).toEqual(
      governanceParameters
    )
  })

  it(`displays deposit period in days`, () => {
    expect(wrapper.vm.depositPeriodInDays).toEqual(2)
  })

  it(`displays voting period in days`, () => {
    expect(wrapper.vm.votingPeriodInDays).toEqual(2)
  })
})
