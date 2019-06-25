import Vuelidate from "vuelidate"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import TabParameters from "src/components/governance/TabParameters"
import mockValues from "test/unit/helpers/mockValues.js"

const { governanceParameters } = mockValues.state

describe(`TabParameters`, () => {
  let wrapper, $store
  const localVue = createLocalVue()
  localVue.use(Vuelidate)
  localVue.directive(`tooltip`, () => {})
  localVue.directive(`focus`, () => {})

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        governanceParameters: {
          parameters: governanceParameters
        },
        totalAtoms: 1000000000,
        session: { atoms: 42 }
      }
    }
    wrapper = shallowMount(TabParameters, {
      localVue,
      mocks: {
        $store
      }
    })
  })

  it(`shows the governance parameters`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`displays the minimum deposit`, () => {
    expect(wrapper.vm.minimumDeposit).toEqual(`100 STAKEs`)
  })

  it(`displays deposit period in days`, () => {
    expect(wrapper.vm.depositPeriodInDays).toEqual(1)
  })

  it(`displays voting period in days`, () => {
    expect(wrapper.vm.votingPeriodInDays).toEqual(1)
  })
})
