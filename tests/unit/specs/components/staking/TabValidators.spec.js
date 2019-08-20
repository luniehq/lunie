import { shallowMount } from "@vue/test-utils"
import TabValidators from "src/components/staking/TabValidators"
import validators from "../../store/json/validators.js"

describe(`TabValidators`, () => {
  let wrapper, $store, $apollo

  const data = {
    validators
  }

  beforeEach(async () => {
    $apollo = {
      queries: {
        validators: {
          loading: false
        }
      }
    }

    wrapper = shallowMount(TabValidators, {
      mocks: {
        $apollo
      }
    })
    wrapper.setData(data)
  })

  it(`shows a list of validators`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows a message if still loading`, async () => {
    wrapper = shallowMount(TabValidators, {
      mocks: {
        $apollo: {
          queries: {
            validators: {
              loading: true
            }
          }
        }
      }
    })
    wrapper.setData({ validators: [] })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows a message if there is nothing to display`, async () => {
    $store = {
      state: {
        validators: []
      }
    }
    wrapper = shallowMount(TabValidators, {
      mocks: {
        $store,
        $apollo
      }
    })

    expect(wrapper.element).toMatchSnapshot()
  })
})
