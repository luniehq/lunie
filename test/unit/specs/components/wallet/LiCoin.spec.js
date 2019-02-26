import {shallowMount} from "@vue/test-utils"
import num from "scripts/num"
import LiCoin from "renderer/components/wallet/LiCoin"

describe(`LiCoin`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(LiCoin, {
      propsData: {
        coin: {
          denom: `Stake`,
          amount: `1000`
        }
      }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should calculate the full amount of the coin`, () => {
    const fullAmount = num.full(wrapper.vm.coin.amount)
    expect(wrapper.vm.amount).toEqual(fullAmount)
  })

  it(`should capitalize the coin denomination`, () => {
    expect(wrapper.vm.denomination).toEqual(`Stake`)
  })
})
