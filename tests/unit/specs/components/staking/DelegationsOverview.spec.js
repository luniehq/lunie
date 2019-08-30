import { shallowMount, createLocalVue } from "@vue/test-utils"
import DelegationsOverview from "staking/DelegationsOverview"
import validators from "../../store/json/validators.js"
import Vuex from "vuex"

describe(`DelegationsOverview`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)

  let wrapper, $store, $apollo

  const getters = {
    committedDelegations: {
      [validators[0].operator_address]: validators[0]
    }
  }

  beforeEach(() => {
    $store = {
      getters
    }

    $apollo = {
      queries: {
        validators: {
          loading: false,
          error: false
        }
      }
    }

    wrapper = shallowMount(DelegationsOverview, {
      mocks: {
        $store,
        $apollo
      },
      propsData: { validators },
      stubs: [`router-link`]
    })
    wrapper.setData({ validators })
  })

  it(`shows an overview over all delegations of the user`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows a sentiment of dissatisfaction when you have no such delegations`, async () => {
    wrapper.setData({ validators: [] })
    expect(wrapper.element).toMatchSnapshot()
  })
})
