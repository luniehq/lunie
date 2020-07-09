import { shallowMount, createLocalVue } from "@vue/test-utils"
import VueClipboard from "vue-clipboard2"
import Address from "src/components/common/Address"
import { formatAddress } from "src/filters"

const localVue = createLocalVue()
localVue.directive(`clipboard`, VueClipboard)
localVue.directive(`tooltip`, () => {})
localVue.filter(`formatAddress`, formatAddress)

describe(`Address Component`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(Address, {
      localVue,
      propsData: { address: `cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e` },
      data: () => ({
        copySuccess: false,
      }),
    })
  })

  it(`should show a short address`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should return 'address not found'`, () => {
    wrapper.setProps({ address: null })
    expect(wrapper.find(".address").text()).toContain(`Address Not Found`)
  })

  it(`should return a short address with everything before the 1`, () => {
    wrapper.setProps({
      address: `cosmosvaloper1qecshyc40kshszkwrtscgmsdd8tz3n4hrj9yf2`,
    })
    expect(wrapper.find(".address").text()).toContain(`cosmosvaloper…9yf2`)
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
    expect(wrapper.find(`.copied`).classes().includes(`active`)).toBe(false)

    wrapper.find(`.address`).trigger(`click`)
    expect(wrapper.find(`.copied`).classes().includes(`active`)).toBe(true)

    jest.runAllTimers()
    expect(wrapper.find(`.copied`).classes().includes(`active`)).toBe(false)
  })
})
