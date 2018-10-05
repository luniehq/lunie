import setup from "../../../helpers/vuex-setup"
import ShortAddress from "renderer/components/common/ShortAddress"

describe(`ShortAddress`, () => {
  let wrapper, store
  let instance = setup()

  beforeEach(() => {
    let test = instance.mount(ShortAddress, {
      propsData: { address: `cosmosftw123456789` }
    })
    wrapper = test.wrapper
    store = test.store
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  // it(`clicking copy copies the address`, async () => {
  //   expect(
  //     wrapper
  //       .find(`.success`)
  //       .classes()
  //       .includes(`showSuccess`)
  //   ).toBe(false)
  //   wrapper.find(`.address`).trigger(`click`)
  //   expect(
  //     wrapper
  //       .find(`.success`)
  //       .classes()
  //       .includes(`showSuccess`)
  //   ).toBe(true)
  //   await sleep(3500)
  //   expect(
  //     wrapper
  //       .find(`.success`)
  //       .classes()
  //       .includes(`showSuccess`)
  //   ).toBe(false)
  // })
})
