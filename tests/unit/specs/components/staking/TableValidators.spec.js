import { shallowMount } from "@vue/test-utils"
import TableValidators from "src/components/staking/TableValidators"
// import validators from "../../store/json/validators.js"

const validators = [
  {moniker: 'cosmos1a', operatorAddress: 'cosmos1a'},
  {moniker: 'cosmos1b', operatorAddress: 'cosmos1b'},
  {moniker: 'cosmos1c', operatorAddress: 'cosmos1c'},
  {moniker: 'cosmos1d', operatorAddress: 'cosmos1d'},
  {moniker: 'cosmos1e', operatorAddress: 'cosmos1e'},
  {moniker: 'cosmos1f', operatorAddress: 'cosmos1f'},
  {moniker: 'cosmos1g', operatorAddress: 'cosmos1g'},
  {moniker: 'cosmos1h', operatorAddress: 'cosmos1h'},
  {moniker: 'cosmos1i', operatorAddress: 'cosmos1i'},
  {moniker: 'cosmos1j', operatorAddress: 'cosmos1j'},
  {moniker: 'cosmos1k', operatorAddress: 'cosmos1k'},
  {moniker: 'cosmos1l', operatorAddress: 'cosmos1l'},
  {moniker: 'cosmos1m', operatorAddress: 'cosmos1m'},
  {moniker: 'cosmos1n', operatorAddress: 'cosmos1n'},
  {moniker: 'cosmos1o', operatorAddress: 'cosmos1o'},
]

describe(`TableValidators`, () => {
  let wrapper


  beforeEach(() => {
    wrapper = shallowMount(TableValidators, {
      propsData: { validators },
      directives: {
        infiniteScroll: () => {}
      }
    })
  })

  it(`shows a validator table`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should add small_moniker property to validators`, () => {
    expect(wrapper.vm.showingValidators[0].small_moniker).toBe(`cosmos1a`)
  })

  it(`should sort the delegates by selected property`, () => {
    wrapper.vm.sort.property = `operatorAddress`
    wrapper.vm.sort.order = `desc`

    expect(
      wrapper.vm.sortedEnrichedValidators.map(x => x.operatorAddress)
    ).toEqual(validators.map(x => x.operatorAddress).reverse())

    wrapper.vm.sort.property = `operatorAddress`
    wrapper.vm.sort.order = `asc`

    expect(
      wrapper.vm.sortedEnrichedValidators.map(x => x.operatorAddress)
    ).toEqual(validators.map(x => x.operatorAddress))
  })

  it(`should load more validators (infinite scrolling)`, async () => {
    wrapper.setData({ showing: 2 })
    expect(wrapper.findAll("livalidator-stub").length).toBe(2)
    wrapper.vm.loadMore()
    expect(wrapper.findAll("livalidator-stub").length).toBe(12)
  })

})
