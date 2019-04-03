import setup from "../../../helpers/vuex-setup"
import num from "scripts/num"
import LiCoin from "renderer/components/wallet/LiCoin"

describe(`LiCoin`, () => {
  let wrapper
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(LiCoin, {
      propsData: {
        coin: {
          denom: `stake`,
          amount: `1000`
        }
      }
    })
    wrapper = instance.wrapper
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should calculate the full amount of the coin`, () => {
    let fullAmount = num.full(wrapper.vm.coin.amount)
    expect(wrapper.vm.amount).toEqual(fullAmount)
  })

  it(`should capitalize the coin denomination`, () => {
    expect(wrapper.vm.denomination).toEqual(`Stake`)
  })
})
