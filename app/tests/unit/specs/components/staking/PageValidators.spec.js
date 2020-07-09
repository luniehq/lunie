import { shallowMount } from "@vue/test-utils"
import PageValidators from "staking/PageValidators"
import validators from "../../store/json/validators.js"

describe(`PageValidators`, () => {
  let wrapper, $apollo, $store

  beforeEach(async () => {
    $apollo = {
      queries: {
        validators: {
          loading: false,
          error: false,
        },
      },
    }

    $store = {
      state: {
        connection: {
          network: "awesomenet",
        },
      },
    }

    wrapper = shallowMount(PageValidators, {
      mocks: {
        $apollo,
        $store,
      },
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
              error: false,
            },
          },
        },
      },
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows a message if there is nothing to display`, async () => {
    wrapper = shallowMount(PageValidators, {
      mocks: {
        $apollo,
      },
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
              error: true,
            },
          },
        },
      },
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows the mobile sorting`, async () => {
    wrapper = shallowMount(PageValidators, {
      mocks: {
        $apollo: {
          queries: {
            validators: {
              loading: false,
              error: true,
            },
          },
        },
      },
    })
    wrapper.vm.toggleMobileSorting()
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`Should toggle between popular / active / all validators`, async () => {
    wrapper = shallowMount(PageValidators, {
      mocks: {
        $apollo: {
          queries: {
            validators: {
              loading: false,
              error: true,
            },
          },
        },
      },
    })
    wrapper.vm.defaultSelectorsController(`popularSort`)
    expect(wrapper.element).toMatchSnapshot()
    wrapper.vm.defaultSelectorsController(`activeOnly`)
    expect(wrapper.element).toMatchSnapshot()
    wrapper.vm.defaultSelectorsController(`allValidators`)
    expect(wrapper.element).toMatchSnapshot()
  })
})
