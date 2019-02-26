import { shallowMount } from "@vue/test-utils"
import TabValidators from "renderer/components/staking/TabValidators"

// we don't show data of a validator in this component so we just provide stubs here
const delegates = new Array(3).fill({})

describe(`TabValidators`, () => {
  let wrapper, $store

  const getters = {
    delegates: {
      delegates,
      loading: false,
      loaded: true
    },
    connected: true
  }

  beforeEach(async () => {
    $store = {
      getters
    }

    wrapper = shallowMount(TabValidators, {
      mocks: {
        $store
      }
    })
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows a message if still connecting`, async () => {
    $store = {
      getters: {
        delegates: {
          delegates,
          loading: false,
          loaded: false
        },
        connected: false
      }
    }

    wrapper = shallowMount(TabValidators, {
      mocks: {
        $store
      }
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows a message if still loading`, async () => {
    $store = {
      getters: {
        delegates: {
          delegates,
          loading: true,
          loaded: false
        },
        connected: true
      }
    }

    wrapper = shallowMount(TabValidators, {
      mocks: {
        $store
      }
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows a message if there is nothing to display`, async () => {
    $store = {
      getters: {
        delegates: {
          delegates: [],
          loading: false,
          loaded: true
        },
        connected: true
      }
    }

    wrapper = shallowMount(TabValidators, {
      mocks: {
        $store
      }
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
