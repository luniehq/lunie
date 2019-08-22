import { shallowMount, createLocalVue } from "@vue/test-utils"
import DelegationsOverview from "staking/DelegationsOverview"
import validators from "../../store/json/validators.js"
import Vuex from "vuex"

describe(`DelegationsOverview`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)

  let wrapper, $store

  const getters = {
    bondDenom: `stake`,
    yourValidators: validators
  }

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      state: {
        delegation: {
          loaded: true
        }
      },
      getters
    }

    wrapper = shallowMount(DelegationsOverview, {
      mocks: {
        $store
      },
      propsData: { validators }
    })
  })

  it(`shows an overview over all delegations of the user`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
