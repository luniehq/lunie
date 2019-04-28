import { shallowMount, createLocalVue } from "@vue/test-utils"
import TabStakingParameters from "src/components/staking/TabStakingParameters"

const stakingParameters = {
  unbonding_time: `259200000000000`,
  max_validators: 100,
  bond_denom: `STAKE`
}

describe(`TabStakingParameters`, () => {
  let wrapper, $store

  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => {})

  const getters = {
    connected: true,
    stakingParameters: {
      parameters: stakingParameters,
      loaded: true
    },
    bondDenom: `stake`
  }

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters
    }

    wrapper = shallowMount(TabStakingParameters, {
      localVue,
      mocks: {
        $store
      }
    })
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`displays unbonding period in days`, () => {
    expect(wrapper.vm.unbondingTimeInDays).toEqual(3)
  })

  it(`displays a message if waiting for connection`, () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        connected: false,
        stakingParameters: {
          parameters: stakingParameters,
          loaded: false,
          loading: false
        },
        bondDenom: `stake`
      }
    }

    wrapper = shallowMount(TabStakingParameters, {
      localVue,
      mocks: {
        $store
      }
    })

    expect(wrapper.contains(`TmDataConnecting-stub`)).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()

    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        connected: true,
        stakingParameters: {
          parameters: stakingParameters,
          loaded: false,
          loading: false
        },
        bondDenom: `stake`
      }
    }

    wrapper = shallowMount(TabStakingParameters, {
      localVue,
      mocks: {
        $store
      }
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.contains(`TmDataConnecting-stub`)).toBe(false)
  })

  it(`displays a message if loading`, () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        connected: true,
        stakingParameters: {
          parameters: stakingParameters,
          loaded: false,
          loading: true
        },
        bondDenom: `stake`
      }
    }

    wrapper = shallowMount(TabStakingParameters, {
      localVue,
      mocks: {
        $store
      }
    })

    expect(wrapper.contains(`TmDataLoading-stub`)).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()

    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        connected: true,
        stakingParameters: {
          parameters: stakingParameters,
          loaded: false,
          loading: false
        },
        bondDenom: `stake`
      }
    }

    wrapper = shallowMount(TabStakingParameters, {
      localVue,
      mocks: {
        $store
      }
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.contains(`tm-data-loading-stub`)).toBe(false)
  })
})
