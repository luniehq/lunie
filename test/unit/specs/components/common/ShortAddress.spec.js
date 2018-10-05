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
})
