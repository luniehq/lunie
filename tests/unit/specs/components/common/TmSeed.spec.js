import { shallowMount, createLocalVue } from "@vue/test-utils"
import VueClipboard from "vue-clipboard2"
import TmSeed from "src/components/common/TmSeed"

const localVue = createLocalVue()
localVue.directive(`clipboard`, VueClipboard)

describe(`TmSeed`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(TmSeed, {
      localVue,
      propsData: {
        value: `two collect olive inside assault finger relief shallow lottery sugar universe fatigue knock current only absurd famous work path zone distance churn include flower`
      },
      data: () => ({
        copySuccess: false
      })
    })
  })

  it(`should render the seed in a table component`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should render the seed in a legacy textarea`, () => {
    wrapper.setProps({ legacy: true })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should split the seed in a 24 words array`, () => {
    const seedWords = [
      `two`,
      `collect`,
      `olive`,
      `inside`,
      `assault`,
      `finger`,
      `relief`,
      `shallow`,
      `lottery`,
      `sugar`,
      `universe`,
      `fatigue`,
      `knock`,
      `current`,
      `only`,
      `absurd`,
      `famous`,
      `work`,
      `path`,
      `zone`,
      `distance`,
      `churn`,
      `include`,
      `flower`
    ]
    expect(wrapper.vm.splitSeed).toEqual(seedWords)
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
