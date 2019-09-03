import { shallowMount } from "@vue/test-utils"
import PageValidators from "staking/PageValidators"
import validators from "../../store/json/validators.js"

describe(`PageValidators`, () => {
  let wrapper, $apollo

  beforeEach(async () => {
    $apollo = {
      queries: {
        validators: {
          loading: false,
          error: false
        }
      }
    }

    wrapper = shallowMount(PageValidators, {
      mocks: {
        $apollo
      }
    })

    wrapper.setData({ validators })
  })

  it(`shows a list of validators`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows a message if still loading`, async () => {
    wrapper = shallowMount(PageValidators, {
      mocks: {
        $apollo: {
          queries: {
            validators: {
              loading: true,
              error: false
            }
          }
        }
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows a message if there is nothing to display`, async () => {
    wrapper = shallowMount(PageValidators, {
      mocks: {
        $apollo
      }
    })
    wrapper.setData({ validators: [] })

    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows a message if there is an error to display`, async () => {
    wrapper = shallowMount(PageValidators, {
      mocks: {
        $apollo: {
          queries: {
            validators: {
              loading: false,
              error: true
            }
          }
        }
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
