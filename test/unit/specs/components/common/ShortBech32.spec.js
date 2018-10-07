import setup from "../../../helpers/vuex-setup"
import ShortBech32 from "renderer/components/common/ShortBech32"

describe(`ShortBech32`, () => {
  let wrapper
  let instance = setup()

  beforeEach(() => {
    let test = instance.mount(ShortBech32, {
      propsData: { address: `cosmosftw123456789` }
    })
    wrapper = test.wrapper
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  it(`should return 'address not found'`, () => {
    wrapper.setProps({ address: null })
    wrapper.update()
    expect(wrapper.vm.shortBech32).toBe(`Address Not Found`)
  })

  it(`should return the address as received`, () => {
    wrapper.setProps({ address: `add1asd` })
    wrapper.update()
    expect(wrapper.vm.shortBech32).toBe(`add1asd`)

    wrapper.setProps({ address: `add2asd` })
    wrapper.update()
    expect(wrapper.vm.shortBech32).toBe(`add2asd`)
  })

  it(`should return a short address with the first 4 letters`, () => {
    wrapper.setProps({ address: `cosmosaddress2asdfasdfasdf` })
    wrapper.update()
    expect(wrapper.vm.shortBech32).toBe(`cosm…asdf`)
  })

  it(`should return a short address with everything before the 1`, () => {
    wrapper.setProps({ address: `cosmosaddress1asdfasdfasdf` })
    wrapper.update()
    expect(wrapper.vm.shortBech32).toBe(`cosmosaddress…asdf`)
  })

  it(`clicking copy copies the address`, async () => {
    expect(
      wrapper
        .find(`.success`)
        .classes()
        .includes(`active`)
    ).toBe(false)
    wrapper.find(`.address`).trigger(`click`)
    expect(
      wrapper
        .find(`.success`)
        .classes()
        .includes(`active`)
    ).toBe(true)
    await sleep(3500)
    expect(
      wrapper
        .find(`.success`)
        .classes()
        .includes(`active`)
    ).toBe(false)
  })

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
})
