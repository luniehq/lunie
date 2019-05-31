import { shallowMount, createLocalVue } from "@vue/test-utils"
import VueClipboard from "vue-clipboard2"
import ShortBech32 from "src/components/common/ShortBech32"

const localVue = createLocalVue()
localVue.directive(`clipboard`, VueClipboard)
localVue.directive(`tooltip`, () => {})

describe(`ShortBech32`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(ShortBech32, {
      localVue,
      propsData: { address: `cosmosftw123456789` },
      data: () => ({
        copySuccess: false
      })
    })
  })

  it(`should show a short address`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should return 'address not found'`, () => {
    wrapper.setProps({ address: null })
    expect(wrapper.vm.shortBech32).toBe(`Address Not Found`)
  })

  it(`should return a validation error message`, () => {
    wrapper.setProps({ address: `cosmosaddress2asdfasdfasdf` })
    expect(wrapper.vm.shortBech32).toBe(`Not A Valid Bech32 Address`)
  })

  it(`should return a short address with everything before the 1`, () => {
    wrapper.setProps({ address: `cosmosaddress1asdfasdfasdf` })
    expect(wrapper.vm.shortBech32).toBe(`cosmosaddress…asdf`)
  })

  it(`should return a long address when long-form set`, () => {
    wrapper.setProps({ address: `cosmosaddress1asdfasdfasdf`, longForm: true })
    expect(wrapper.find(".address").text()).toBe(`cosmosaddress1asdfasdfasdf`)
  })

  it(`should calculate a long address`, () => {
    wrapper.setProps({ address: `cosmosaddress1asdfasdfasdf`, longForm: true })
    expect(wrapper.vm.bech32).toBe(`cosmosaddress1asdfasdfasdf`)
  })

  describe(`onCopy`, () => {
    it(`should set and reset copySuccess`, () => {
      jest.useFakeTimers()
      wrapper.vm.onCopy() // old test style to make timer work
      expect(wrapper.vm.copySuccess).toBe(true)

      jest.runAllTimers()
      expect(wrapper.vm.copySuccess).toBe(false)
    })
  })

  // TODO: not sure how to test the v-clipboard directive events
  xit(`clicking copy copies the address`, () => {
    jest.useFakeTimers()
    expect(
      wrapper
        .find(`.copied`)
        .classes()
        .includes(`active`)
    ).toBe(false)

    wrapper.find(`.address`).trigger(`click`)
    expect(
      wrapper
        .find(`.copied`)
        .classes()
        .includes(`active`)
    ).toBe(true)

    jest.runAllTimers()
    expect(
      wrapper
        .find(`.copied`)
        .classes()
        .includes(`active`)
    ).toBe(false)
  })
})
