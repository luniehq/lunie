import NiOnboarding from "common/NiOnboarding.vue"
import htmlBeautify from "html-beautify"
import setup from "../../../helpers/vuex-setup"

jest.mock(
  "../../../../../app/src/renderer/assets/images/onboarding/step-0.png",
  () => jest.fn()
)
jest.mock(
  "../../../../../app/src/renderer/assets/images/onboarding/step-1.png",
  () => jest.fn()
)
jest.mock(
  "../../../../../app/src/renderer/assets/images/onboarding/step-2.png",
  () => jest.fn()
)
jest.mock(
  "../../../../../app/src/renderer/assets/images/onboarding/step-3.png",
  () => jest.fn()
)
jest.mock(
  "../../../../../app/src/renderer/assets/images/onboarding/step-4.png",
  () => jest.fn()
)

describe("NiOnboarding", () => {
  let wrapper, store, instance
  let { mount } = setup()

  beforeEach(() => {
    instance = mount(NiOnboarding)
    wrapper = instance.wrapper
    store = instance.store
    wrapper.update()
  })

  it("has the expected html structure 0", () => {
    store.commit("setOnboardingState", "0")
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it("has the expected html structure 1", () => {
    store.commit("setOnboardingState", "1")
    wrapper.update()
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it("has the expected html structure 2", () => {
    store.commit("setOnboardingState", "2")
    wrapper.update()
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it("has the expected html structure 3", () => {
    store.commit("setOnboardingState", "3")
    wrapper.update()
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it("has the expected html structure 4", () => {
    store.commit("setOnboardingState", "4")
    wrapper.update()
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })
})
