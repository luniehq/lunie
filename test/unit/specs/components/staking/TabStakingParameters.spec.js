import {shallowMount, createLocalVue} from "@vue/test-utils"
import TabStakingParameters from "renderer/components/staking/TabStakingParameters"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

const { stakingParameters } = lcdClientMock.state

describe(`TabStakingParameters`, () => {
  let wrapper, $store

  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => {})

  const getters = {
    connected: true,
    stakingParameters: {
      parameters: stakingParameters.parameters,
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

  it(`shows the max number of validators`, () => {
    expect(wrapper.find(`#max_validators`).html()).toContain(
      stakingParameters.parameters.max_validators
    )
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
          parameters: stakingParameters.parameters,
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

    expect(wrapper.contains(`tm-data-connecting-stub`)).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()

    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        connected: true,
        stakingParameters: {
          parameters: stakingParameters.parameters,
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
    expect(wrapper.contains(`tm-data-connecting-stub`)).toBe(false)
  })

  it(`displays a message if loading`, () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        connected: true,
        stakingParameters: {
          parameters: stakingParameters.parameters,
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

    expect(wrapper.contains(`tm-data-loading-stub`)).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()

    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        connected: true,
        stakingParameters: {
          parameters: stakingParameters.parameters,
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
