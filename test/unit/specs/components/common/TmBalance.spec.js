import { shallowMount } from "@vue/test-utils"
import TmBalance from "common/TmBalance"

describe(`TmBalance`, () => {
  let wrapper, $store

  beforeEach(() => {
    $store = {
      getters: {
        session: {
          address: `cosmos1address`
        },
        liquidAtoms: 123,
        totalAtoms: 321,
        bondDenom: `stake`,
        distribution: {
          totalRewards: {
            stake: 100045
          }
        }
      }
    }

    wrapper = shallowMount(TmBalance, {
      mocks: {
        $store
      }
    })
  })

  it(`has the expected html structure before adding props`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
