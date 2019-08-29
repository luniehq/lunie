import { shallowMount } from "@vue/test-utils"
import TableValidators from "src/components/staking/TableValidators"
import validators from "../../store/json/validators.js"

describe(`TableValidators`, () => {
  let wrapper, $store

  const getters = {
    committedDelegations: {
      [validators[0].operator_address]: 10
    },

    bondDenom: `stake`,

    lastHeader: {
      chain_id: `gaia-20k`,
      height: `6001`
    }
  }

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      state: {
        minting: {
          annualProvision: "100"
        },
        distribution: {
          loaded: true,
          rewards: {
            cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw: {
              stake: 1000
            }
          }
        },
        pool: {
          pool: {
            bonded_tokens: 1000
          }
        },
        delegates: {
          signingInfos: {
            cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw: {
              missed_blocks_counter: 2
            }
          }
        },
        session: {
          address: `address1234`,
          signedIn: true
        }
      },
      getters: JSON.parse(JSON.stringify(getters)) // clone so we don't overwrite by accident
    }

    wrapper = shallowMount(TableValidators, {
      mocks: {
        $store
      },
      propsData: { validators },
      directives: {
        infiniteScroll: () => {}
      }
    })
    wrapper.setData({ rollingWindow: 10000 })
  })

  it(`shows a validator table`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should create an enriched validator object for a signed in user`, () => {
    expect(wrapper.vm.enrichedValidators[0].small_moniker).toBe(`mr_mounty`)
    expect(wrapper.vm.enrichedValidators[0].voting_power).toBe(`0.0140000000`)
    expect(wrapper.vm.enrichedValidators[0].my_delegations).toBe(10)
    expect(wrapper.vm.enrichedValidators[0].commission).toBe("0")
    expect(wrapper.vm.enrichedValidators[0].rewards).toBe(1000)
    expect(wrapper.vm.enrichedValidators[0].expectedReturns).toBe(0.1)
  })

  it(`should create an enriched validator object for a user who is not signed in `, () => {
    wrapper.vm.session.signedIn = false
    expect(wrapper.vm.enrichedValidators[1].my_delegations).toBe(0)
    expect(wrapper.vm.enrichedValidators[1].rewards).toBe(0)
  })

  it(`should sort the delegates by selected property`, () => {
    wrapper.vm.sort.property = `operator_address`
    wrapper.vm.sort.order = `desc`

    expect(
      wrapper.vm.sortedEnrichedValidators.map(x => x.operator_address)
    ).toEqual(validators.map(x => x.operator_address))

    wrapper.vm.sort.property = `operator_address`
    wrapper.vm.sort.order = `asc`

    expect(
      wrapper.vm.sortedEnrichedValidators.map(x => x.operator_address)
    ).toEqual(validators.map(x => x.operator_address).reverse())
  })

  it(`should load more validators (infinite scrolling)`, async () => {
    wrapper.setData({ showing: 2 })
    expect(wrapper.findAll("livalidator-stub").length).toBe(2)
    wrapper.vm.loadMore()
    expect(wrapper.findAll("livalidator-stub").length).toBe(3)
  })

  it(`should update rewards on new blocks`, () => {
    const $store = { dispatch: jest.fn() }
    const newHeader = { height: `30` }
    TableValidators.watch.lastHeader.handler.call({ $store }, newHeader)
    expect($store.dispatch).toHaveBeenCalledWith(`getRewardsFromMyValidators`)
  })
})
