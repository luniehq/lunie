import { shallowMount } from "@vue/test-utils"
import LiCoin from "renderer/components/wallet/LiCoin"

describe(`LiCoin`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(LiCoin, {
      propsData: {
        coin: {
          denom: `Stake`,
          amount: `10000000000`
        }
      }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should calculate the full amount of the coin`, () => {
    expect(wrapper.vm.amount).toEqual(`1,000.0000000`)
  })

  it(`should capitalize the coin denomination`, () => {
    expect(wrapper.vm.denomination).toEqual(`Stake`)
  })
})
