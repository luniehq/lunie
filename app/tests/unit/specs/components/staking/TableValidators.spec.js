import { shallowMount } from "@vue/test-utils"
import TableValidators from "src/components/staking/TableValidators"

const validators = [
  { name: "cosmos1a", operatorAddress: "cosmos1a" },
  { name: "cosmos1b", operatorAddress: "cosmos1b" },
  { name: "cosmos1c", operatorAddress: "cosmos1c" },
  { name: "cosmos1d", operatorAddress: "cosmos1d" },
  { name: "cosmos1e", operatorAddress: "cosmos1e" },
  { name: "cosmos1f", operatorAddress: "cosmos1f" },
  { name: "cosmos1g", operatorAddress: "cosmos1g" },
  { name: "cosmos1h", operatorAddress: "cosmos1h" },
  { name: "cosmos1i", operatorAddress: "cosmos1i" },
  { name: "cosmos1j", operatorAddress: "cosmos1j" },
  { name: "cosmos1k", operatorAddress: "cosmos1k" },
  { name: "cosmos1l", operatorAddress: "cosmos1l" },
  { name: "cosmos1m", operatorAddress: "cosmos1m" },
  { name: "cosmos1n", operatorAddress: "cosmos1n" },
  { name: "cosmos1o", operatorAddress: "cosmos1o" },
]

describe(`TableValidators`, () => {
  let wrapper, $apollo, $store

  $apollo = {
    queries: {
      rewards: {
        loading: false,
        error: false,
        startPolling: jest.fn(),
      },
    },
  }

  beforeEach(() => {
    $store = {
      getters: {
        address: "cosmo1",
        stakingDenom: "ATOM",
      },
      state: {},
    }

    wrapper = shallowMount(TableValidators, {
      propsData: {
        validators,
        showMobileSorting: true,
      },
      directives: {
        infiniteScroll: () => {},
      },
      mocks: {
        $apollo,
        $store,
      },
    })
  })

  it(`shows a validator table`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should sort the delegates by selected property`, () => {
    wrapper.vm.sortBy(`operatorAddress`)
    wrapper.vm.sort.order = `desc`

    expect(
      wrapper.vm.sortedEnrichedValidators.map((x) => x.operatorAddress)
    ).toEqual(validators.map((x) => x.operatorAddress).reverse())

    wrapper.vm.sortBy(`operatorAddress`)
    wrapper.vm.sort.order = `asc`

    expect(
      wrapper.vm.sortedEnrichedValidators.map((x) => x.operatorAddress)
    ).toEqual(validators.map((x) => x.operatorAddress))
  })

  it(`should load more validators (infinite scrolling)`, async () => {
    wrapper.setData({ showing: 2 })
    expect(wrapper.findAll("livalidator-stub").length).toBe(2)
    wrapper.vm.loadMore()
    expect(wrapper.findAll("livalidator-stub").length).toBe(12)
  })
})
